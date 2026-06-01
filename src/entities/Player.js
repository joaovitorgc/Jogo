import Phaser from 'phaser';
import CharacterConfig from '../config/CharacterConfig.js';
import GameConfig from '../config/GameConfig.js';
import Projectile from './Projectile.js';
import ParticleManager from './ParticleManager.js';

export default class Player {

    constructor(scene, x, y, element) {

        this.scene = scene;
        this.element = element;
        this.data = CharacterConfig[element];

        // Stats base
        this.hp = this.data.vida;
        this.maxHp = this.data.vida;
        this.speed = this.data.velocidade / 60;

        // Estados
        this.isAlive = true;
        this.isStunned = false;
        this.isFrozen = false;
        this.isDashing = false;
        this.isInvincible = false;
        this.isParrying = false;
        this.stunTimer = 0;
        this.frozenTimer = 0;
        this.dashTimer = 0;
        this.parryTimer = 0;

        // Ultimate
        this.ultimateCharge = 0;
        this.ultimateMaxCharge = GameConfig.ultimateMaxCharge;
        this.ultimateReady = false;

        // Combo
        this.comboCount = 0;
        this.lastComboTime = 0;

        // Cooldowns de ataque
        this.lastAttack = 0;
        this.attackCooldown = 300;
        this.lastSpecial = 0;
        this.specialCooldown = 1000;
        this.lastUltimate = 0;
        this.ultimateCooldown = 8000;
        this.lastParry = 0;
        this.parryCooldown = GameConfig.parryCooldown;
        this.lastDash = 0;
        this.dashCooldown = GameConfig.dashCooldown;

        // Direção que o jogador está olhando
        this.facingRight = true;

        // Velocidade de dash
        this.dashVx = 0;
        this.dashVy = 0;

        // Construir visual do personagem
        this._buildSprite(x, y);

        // Efeito de idle
        this._startIdleEffect();

    }

    _buildSprite(x, y) {

        // Corpo principal
        this.sprite = this.scene.add.circle(
            x, y, 35, this.data.cor
        ).setDepth(10);

        // Anel de elemento (aura)
        this.aura = this.scene.add.circle(
            x, y, 45, this.data.cor, 0.2
        ).setDepth(9);

        // Anel externo pulsante
        this.ring = this.scene.add.circle(
            x, y, 42, this.data.cor, 0
        ).setDepth(9);
        this.ring.setStrokeStyle(2, this.data.cor, 0.8);

        // Label do elemento
        this.label = this.scene.add.text(
            x, y - 55,
            this.data.nome,
            {
                fontSize: '13px',
                color: '#ffffff',
                fontFamily: 'Arial Black',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(11);

        // Indicador de parry
        this.parryShield = this.scene.add.circle(
            x, y, 50, 0xffffff, 0
        ).setDepth(12);

    }

    _startIdleEffect() {

        this.scene.tweens.add({
            targets: [this.aura, this.ring],
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.4,
            duration: 900 + Math.random() * 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

    }

    _syncVisuals() {

        const x = this.sprite.x;
        const y = this.sprite.y;

        this.aura.setPosition(x, y);
        this.ring.setPosition(x, y);
        this.label.setPosition(x, y - 55);
        this.parryShield.setPosition(x, y);

    }

    update(keys, isPlayer1) {

        if (!this.isAlive) return;

        // Atualizar timers de estado
        const now = Date.now();

        if (this.isStunned) {
            this.stunTimer -= 16;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
                this.sprite.setAlpha(1);
            }
            this._syncVisuals();
            return;
        }

        if (this.isFrozen) {
            this.frozenTimer -= 16;
            if (this.frozenTimer <= 0) {
                this.isFrozen = false;
                this._removeFreezeEffect();
            }
            this._syncVisuals();
            return;
        }

        // Dash
        if (this.isDashing) {
            this.dashTimer -= 16;
            this.sprite.x += this.dashVx;
            this.sprite.y += this.dashVy;
            this._clampToBounds();
            this._syncVisuals();

            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.isInvincible = false;
            }
            return;
        }

        // Movimento normal
        let up, down, left, right;

        if (isPlayer1) {
            up = keys.p1up;
            down = keys.p1down;
            left = keys.p1left;
            right = keys.p1right;
        } else {
            up = keys.p2up;
            down = keys.p2down;
            left = keys.p2left;
            right = keys.p2right;
        }

        if (up.isDown)    this.sprite.y -= this.speed;
        if (down.isDown)  this.sprite.y += this.speed;
        if (left.isDown) {
            this.sprite.x -= this.speed;
            this.facingRight = false;
        }
        if (right.isDown) {
            this.sprite.x += this.speed;
            this.facingRight = true;
        }

        this._clampToBounds();
        this._syncVisuals();

    }

    _clampToBounds() {

        const b = {
            left: 80,
            right: 1520,
            top: 80,
            bottom: 840
        };

        this.sprite.x = Phaser.Math.Clamp(
            this.sprite.x, b.left, b.right
        );
        this.sprite.y = Phaser.Math.Clamp(
            this.sprite.y, b.top, b.bottom
        );

    }

    // ─────────────────── ATAQUE NORMAL ───────────────────

    attack(enemy) {

        const now = Date.now();
        if (now - this.lastAttack < this.attackCooldown) return;
        this.lastAttack = now;

        // Verificar se o inimigo faz parry
        if (enemy.isParrying) {
            enemy.onSuccessfulParry(this);
            return;
        }

        const dist = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            enemy.sprite.x, enemy.sprite.y
        );

        if (dist > GameConfig.attackRange) return;

        // Dano base com variação
        let dmg = this.data.dano * (0.9 + Math.random() * 0.2);

        // Knockback direcional
        const dx = enemy.sprite.x - this.sprite.x;
        const dy = enemy.sprite.y - this.sprite.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = GameConfig.knockbackForce;

        enemy.receberDano(dmg, this);
        enemy.sprite.x += (dx / len) * force;
        enemy.sprite.y += (dy / len) * force;
        enemy._clampToBounds();

        // Efeito visual do ataque normal (único por elemento)
        this._attackEffect(enemy);

        // Carregar ultimate
        this._chargeUltimate(GameConfig.ultimateChargePerHit);

        // Tela shake leve
        this.scene.cameras.main.shake(80, 0.004);

    }

    _attackEffect(enemy) {

        const ex = enemy.sprite.x;
        const ey = enemy.sprite.y;

        switch (this.element) {

            case 'fire': {
                // Onda de chama
                const ring = this.scene.add.circle(ex, ey, 20, 0xff4500, 0.9).setDepth(20);
                this.scene.tweens.add({
                    targets: ring,
                    scaleX: 3, scaleY: 3,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => ring.destroy()
                });
                break;
            }

            case 'water': {
                // Bolha que explode
                const bubble = this.scene.add.circle(ex, ey, 25, 0x00bfff, 0.7).setDepth(20);
                bubble.setStrokeStyle(3, 0xffffff, 0.9);
                this.scene.tweens.add({
                    targets: bubble,
                    scaleX: 2.5, scaleY: 2.5,
                    alpha: 0,
                    duration: 350,
                    ease: 'Back.easeOut',
                    onComplete: () => bubble.destroy()
                });
                break;
            }

            case 'electric': {
                // Flash de luz branca
                const flash = this.scene.add.circle(ex, ey, 15, 0xffffff, 1).setDepth(20);
                for (let i = 0; i < 4; i++) {
                    const bolt = this.scene.add.circle(
                        ex + Phaser.Math.Between(-30, 30),
                        ey + Phaser.Math.Between(-30, 30),
                        5, 0xffe600, 1
                    ).setDepth(20);
                    this.scene.tweens.add({
                        targets: bolt, alpha: 0, duration: 200,
                        onComplete: () => bolt.destroy()
                    });
                }
                this.scene.tweens.add({
                    targets: flash, scaleX: 4, scaleY: 4, alpha: 0,
                    duration: 150, onComplete: () => flash.destroy()
                });
                break;
            }

            case 'ice': {
                // Cristal de gelo expandindo
                const ice = this.scene.add.rectangle(ex, ey, 40, 40, 0x00e5ff, 0.8)
                    .setDepth(20).setRotation(Math.PI / 4);
                this.scene.tweens.add({
                    targets: ice, scaleX: 3, scaleY: 3, alpha: 0,
                    duration: 400, ease: 'Cubic.easeOut',
                    onComplete: () => ice.destroy()
                });
                break;
            }

            case 'stone': {
                // Rochas orbitando
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2;
                    const rock = this.scene.add.rectangle(
                        ex + Math.cos(angle) * 30,
                        ey + Math.sin(angle) * 30,
                        14, 14, 0x8b7355, 1
                    ).setDepth(20);
                    this.scene.tweens.add({
                        targets: rock, x: ex, y: ey, alpha: 0,
                        duration: 300, ease: 'Cubic.easeIn',
                        onComplete: () => rock.destroy()
                    });
                }
                break;
            }

            case 'wind': {
                // Arco de vento circular
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    const wisp = this.scene.add.circle(
                        ex + Math.cos(angle) * 20,
                        ey + Math.sin(angle) * 20,
                        8, 0x98fb98, 0.8
                    ).setDepth(20);
                    this.scene.tweens.add({
                        targets: wisp,
                        x: ex + Math.cos(angle) * 50,
                        y: ey + Math.sin(angle) * 50,
                        alpha: 0, scaleX: 0.3, scaleY: 0.3,
                        duration: 350, ease: 'Cubic.easeOut',
                        onComplete: () => wisp.destroy()
                    });
                }
                break;
            }

            case 'metal': {
                // Corte metálico
                const slash = this.scene.add.rectangle(ex, ey, 80, 6, 0xe8e8e8, 1)
                    .setDepth(20)
                    .setRotation(Math.atan2(
                        enemy.sprite.y - this.sprite.y,
                        enemy.sprite.x - this.sprite.x
                    ));
                this.scene.tweens.add({
                    targets: slash, scaleX: 0.1, alpha: 0,
                    duration: 200, onComplete: () => slash.destroy()
                });
                break;
            }

            case 'sand': {
                // Nuvem de areia
                for (let i = 0; i < 8; i++) {
                    const grain = this.scene.add.circle(
                        ex + Phaser.Math.Between(-15, 15),
                        ey + Phaser.Math.Between(-15, 15),
                        Phaser.Math.Between(4, 10),
                        0xc2955a, 0.9
                    ).setDepth(20);
                    this.scene.tweens.add({
                        targets: grain,
                        x: grain.x + Phaser.Math.Between(-40, 40),
                        y: grain.y + Phaser.Math.Between(-40, 40),
                        alpha: 0, scaleX: 0.2, scaleY: 0.2,
                        duration: 400, ease: 'Cubic.easeOut',
                        onComplete: () => grain.destroy()
                    });
                }
                break;
            }

            case 'darkness': {
                // Buraco negro por 1 segundo
                const void_ = this.scene.add.circle(ex, ey, 15, 0x000000, 0.9).setDepth(20);
                void_.setStrokeStyle(3, 0x800080, 1);
                this.scene.tweens.add({
                    targets: void_,
                    scaleX: 2.5, scaleY: 2.5,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => void_.destroy()
                });
                break;
            }

            case 'sound': {
                // Onda sonora concêntrica
                for (let i = 1; i <= 3; i++) {
                    this.scene.time.delayedCall(i * 60, () => {
                        const wave = this.scene.add.circle(ex, ey, 10, 0xff69b4, 0).setDepth(20);
                        wave.setStrokeStyle(3, 0xff69b4, 0.9);
                        this.scene.tweens.add({
                            targets: wave,
                            scaleX: i * 2.5, scaleY: i * 2.5,
                            alpha: 0,
                            duration: 400,
                            onComplete: () => wave.destroy()
                        });
                    });
                }
                break;
            }

        }

    }

    // ─────────────────── ATAQUE ESPECIAL (PROJÉTIL) ───────────────────

    specialAttack() {

        const now = Date.now();
        if (now - this.lastSpecial < this.specialCooldown) return;
        this.lastSpecial = now;

        let direction = this.facingRight ? 1 : -1;

        const configs = {
            fire:     { damage: 28, size: 25, speed: 14, element: 'fire' },
            water:    { damage: 18, size: 32, speed: 10, element: 'water' },
            electric: { damage: 22, size: 15, speed: 22, element: 'electric' },
            ice:      { damage: 14, size: 26, speed: 9,  element: 'ice' },
            stone:    { damage: 34, size: 36, speed: 7,  element: 'stone' },
            wind:     { damage: 12, size: 13, speed: 26, element: 'wind' },
            metal:    { damage: 26, size: 20, speed: 17, element: 'metal' },
            sand:     { damage: 20, size: 28, speed: 11, element: 'sand' },
            darkness: { damage: 24, size: 23, speed: 13, element: 'darkness' },
            sound:    { damage: 19, size: 18, speed: 19, element: 'sound' }
        };

        const cfg = configs[this.element];

        const proj = new Projectile(
            this.scene,
            this.sprite.x,
            this.sprite.y,
            this.data.cor,
            cfg.speed * direction,
            this
        );

        proj.damage = cfg.damage;
        proj.element = cfg.element;
        proj.sprite.setRadius(cfg.size);

        // Efeito de lançamento
        const launch = this.scene.add.circle(
            this.sprite.x, this.sprite.y,
            cfg.size + 10, this.data.cor, 0.6
        ).setDepth(15);

        this.scene.tweens.add({
            targets: launch,
            scaleX: 2.5, scaleY: 2.5, alpha: 0,
            duration: 250,
            onComplete: () => launch.destroy()
        });

    }

    // ─────────────────── ULTIMATE ───────────────────

    ultimate(enemy) {

        if (!this.ultimateReady) return;

        const now = Date.now();
        if (now - this.lastUltimate < this.ultimateCooldown) return;
        this.lastUltimate = now;

        this.ultimateCharge = 0;
        this.ultimateReady = false;

        // Efeito visual de ativação
        this._ultimateActivationEffect();

        // Executar ultimate do elemento
        this._executeUltimate(enemy);

        // Shake forte
        this.scene.cameras.main.shake(400, 0.016);

    }

    _ultimateActivationEffect() {

        const x = this.sprite.x;
        const y = this.sprite.y;

        // Flash branco no personagem
        const flash = this.scene.add.circle(x, y, 80, 0xffffff, 0.9).setDepth(30);
        this.scene.tweens.add({
            targets: flash, scaleX: 3, scaleY: 3, alpha: 0,
            duration: 500, ease: 'Expo.easeOut',
            onComplete: () => flash.destroy()
        });

        // Texto da ultimate
        const txt = this.scene.add.text(
            x, y - 90,
            this.data.ultimateName,
            {
                fontSize: '22px',
                color: '#ffffff',
                fontFamily: 'Arial Black',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(35);

        this.scene.tweens.add({
            targets: txt,
            y: y - 160, alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });

    }

    _executeUltimate(enemy) {

        switch (this.element) {

            case 'fire':
                this._ultimate_fire(enemy);
                break;
            case 'water':
                this._ultimate_water(enemy);
                break;
            case 'electric':
                this._ultimate_electric(enemy);
                break;
            case 'ice':
                this._ultimate_ice(enemy);
                break;
            case 'stone':
                this._ultimate_stone(enemy);
                break;
            case 'wind':
                this._ultimate_wind(enemy);
                break;
            case 'metal':
                this._ultimate_metal(enemy);
                break;
            case 'sand':
                this._ultimate_sand(enemy);
                break;
            case 'darkness':
                this._ultimate_darkness(enemy);
                break;
            case 'sound':
                this._ultimate_sound(enemy);
                break;

        }

    }

    // ────── ULTIMATES INDIVIDUAIS ──────

    _ultimate_fire(enemy) {

        // 3 ondas de fogo concêntricas expandindo da posição do inimigo
        const cx = enemy.sprite.x;
        const cy = enemy.sprite.y;

        for (let wave = 0; wave < 3; wave++) {
            this.scene.time.delayedCall(wave * 180, () => {
                const ring = this.scene.add.circle(cx, cy, 30, 0xff4500, 0.8).setDepth(25);
                ring.setStrokeStyle(6, 0xffcc00, 1);
                this.scene.tweens.add({
                    targets: ring,
                    scaleX: 14, scaleY: 14, alpha: 0,
                    duration: 700, ease: 'Expo.easeOut',
                    onComplete: () => ring.destroy()
                });
            });
        }

        // 6 bolas de fogo em leque
        for (let i = 0; i < 6; i++) {
            const angle = ((i / 6) * Math.PI * 2);
            const fireball = this.scene.add.circle(
                this.sprite.x, this.sprite.y,
                20, 0xff4500, 1
            ).setDepth(22);

            const tx = this.sprite.x + Math.cos(angle) * 600;
            const ty = this.sprite.y + Math.sin(angle) * 600;

            this.scene.tweens.add({
                targets: fireball,
                x: tx, y: ty,
                scaleX: 0.2, scaleY: 0.2,
                alpha: 0,
                duration: 900, ease: 'Cubic.easeIn',
                onComplete: () => fireball.destroy()
            });
        }

        // Dano massivo
        enemy.receberDano(120, this);

    }

    _ultimate_water(enemy) {

        const width = this.scene.cameras.main.width;

        // Tsunami: onda varre a tela inteira
        const tsunami = this.scene.add.rectangle(
            this.sprite.x < 800 ? -200 : width + 200,
            500, 300, 900, 0x00bfff, 0.85
        ).setDepth(26);

        const targetX = this.sprite.x < 800 ? width + 400 : -400;

        this.scene.tweens.add({
            targets: tsunami,
            x: targetX,
            duration: 1100,
            ease: 'Cubic.easeIn',
            onComplete: () => tsunami.destroy()
        });

        // Empurrar inimigo na direção da onda
        const dir = this.sprite.x < 800 ? 1 : -1;
        enemy.sprite.x += dir * 400;
        enemy._clampToBounds();

        // Bolhas decorativas
        for (let i = 0; i < 10; i++) {
            this.scene.time.delayedCall(i * 80, () => {
                const b = this.scene.add.circle(
                    Phaser.Math.Between(100, 1500),
                    Phaser.Math.Between(200, 700),
                    Phaser.Math.Between(10, 35),
                    0x87cefa, 0.7
                ).setDepth(27);
                this.scene.tweens.add({
                    targets: b, y: b.y - 200, alpha: 0,
                    duration: 600, ease: 'Cubic.easeOut',
                    onComplete: () => b.destroy()
                });
            });
        }

        enemy.receberDano(100, this);

    }

    _ultimate_electric(enemy) {

        // Raios em todas as direções do inimigo
        const cx = enemy.sprite.x;
        const cy = enemy.sprite.y;

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const len = Phaser.Math.Between(150, 500);

            // Raio como linha (retângulo fino)
            const bolt = this.scene.add.rectangle(
                cx, cy,
                len, 4,
                0xffe600, 1
            ).setOrigin(0, 0.5).setDepth(25).setRotation(angle);

            this.scene.tweens.add({
                targets: bolt, alpha: 0,
                duration: 300 + Math.random() * 200,
                onComplete: () => bolt.destroy()
            });
        }

        // Flash total na tela
        const screenFlash = this.scene.add.rectangle(
            800, 450, 1600, 900, 0xffffff, 0.5
        ).setDepth(40);
        this.scene.tweens.add({
            targets: screenFlash, alpha: 0,
            duration: 400,
            onComplete: () => screenFlash.destroy()
        });

        // Stun no inimigo
        enemy.aplicarStun(1200);
        enemy.receberDano(110, this);

    }

    _ultimate_ice(enemy) {

        // Congelar inimigo completamente
        enemy.aplicarGelo(3000);

        // Cristais crescendo ao redor do inimigo
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 60;
            const crystal = this.scene.add.rectangle(
                enemy.sprite.x + Math.cos(angle) * dist,
                enemy.sprite.y + Math.sin(angle) * dist,
                20, 50, 0x00e5ff, 0.9
            ).setDepth(25).setRotation(angle);

            crystal.setScale(0, 0);
            this.scene.tweens.add({
                targets: crystal,
                scaleX: 1, scaleY: 1,
                duration: 400, ease: 'Back.easeOut'
            });

            // Desaparecer quando acabar o gelo
            this.scene.time.delayedCall(3000, () => {
                this.scene.tweens.add({
                    targets: crystal, alpha: 0, scaleX: 0, scaleY: 0,
                    duration: 300, onComplete: () => crystal.destroy()
                });
            });
        }

        enemy.receberDano(90, this);

    }

    _ultimate_stone(enemy) {

        // Pedras caindo do topo da tela
        for (let i = 0; i < 8; i++) {
            this.scene.time.delayedCall(i * 120, () => {
                const tx = enemy.sprite.x + Phaser.Math.Between(-200, 200);
                const rock = this.scene.add.rectangle(
                    tx, -40,
                    Phaser.Math.Between(30, 70),
                    Phaser.Math.Between(30, 70),
                    0x8b7355, 1
                ).setDepth(25).setRotation(Math.random() * Math.PI);

                this.scene.tweens.add({
                    targets: rock,
                    y: 860, alpha: 0,
                    duration: 600, ease: 'Cubic.easeIn',
                    onComplete: () => {
                        // Impacto
                        const dust = this.scene.add.circle(tx, 840, 40, 0xd2b48c, 0.7).setDepth(24);
                        this.scene.tweens.add({
                            targets: dust, scaleX: 3, scaleY: 1, alpha: 0,
                            duration: 300, onComplete: () => {
                                dust.destroy();
                                rock.destroy();
                            }
                        });
                    }
                });
            });
        }

        enemy.receberDano(140, this);
        this.scene.cameras.main.shake(600, 0.018);

    }

    _ultimate_wind(enemy) {

        // Ciclone puxando o inimigo em espiral
        const cx = 800;
        const cy = 450;

        // Anéis de vento em espiral
        for (let i = 0; i < 6; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const ring = this.scene.add.circle(cx, cy, 20 + i * 30, 0x98fb98, 0).setDepth(22);
                ring.setStrokeStyle(4, 0x7fff00, 0.7);
                this.scene.tweens.add({
                    targets: ring,
                    scaleX: 2, scaleY: 2, alpha: 0,
                    duration: 800, ease: 'Cubic.easeOut',
                    onComplete: () => ring.destroy()
                });
            });
        }

        // Puxar inimigo ao centro e empurrar
        this.scene.tweens.add({
            targets: [enemy.sprite, enemy.aura, enemy.ring, enemy.label],
            x: cx, y: cy,
            duration: 500, ease: 'Cubic.easeIn',
            onComplete: () => {
                // Arremessar para o canto oposto
                const side = enemy.sprite.x < 800 ? 1 : -1;
                enemy.sprite.x += side * 600;
                enemy._clampToBounds();
            }
        });

        enemy.receberDano(95, this);

    }

    _ultimate_metal(enemy) {

        // Chuva de lâminas de cima
        for (let i = 0; i < 12; i++) {
            this.scene.time.delayedCall(i * 80, () => {
                const bx = Phaser.Math.Between(100, 1500);
                const blade = this.scene.add.rectangle(
                    bx, -20, 8, 50, 0xc0c0c0, 1
                ).setDepth(25).setRotation(Phaser.Math.Between(-20, 20) * Math.PI / 180);

                this.scene.tweens.add({
                    targets: blade,
                    y: 900, alpha: 0,
                    duration: Phaser.Math.Between(400, 700),
                    ease: 'Cubic.easeIn',
                    onComplete: () => blade.destroy()
                });

                // Se atingir o inimigo
                const dist = Math.abs(bx - enemy.sprite.x);
                if (dist < 50) {
                    enemy.receberDano(15, this);
                    this.scene.cameras.main.shake(100, 0.005);
                }
            });
        }

        // Dano base garantido
        this.scene.time.delayedCall(500, () => enemy.receberDano(80, this));

    }

    _ultimate_sand(enemy) {

        // Nuvem de areia cobrindo TODA a tela
        const sandCloud = this.scene.add.rectangle(
            800, 450, 1600, 900, 0xc2955a, 0.7
        ).setDepth(28);

        sandCloud.setAlpha(0);
        this.scene.tweens.add({
            targets: sandCloud,
            alpha: 0.7,
            duration: 400,
            yoyo: true,
            hold: 1200,
            onComplete: () => sandCloud.destroy()
        });

        // Grãos de areia em espiral
        for (let i = 0; i < 20; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                const grain = this.scene.add.circle(
                    enemy.sprite.x + Phaser.Math.Between(-300, 300),
                    enemy.sprite.y + Phaser.Math.Between(-300, 300),
                    Phaser.Math.Between(5, 18),
                    0xd4a55a, 0.9
                ).setDepth(29);

                this.scene.tweens.add({
                    targets: grain,
                    x: enemy.sprite.x,
                    y: enemy.sprite.y,
                    alpha: 0,
                    duration: 600 + Math.random() * 300,
                    ease: 'Cubic.easeIn',
                    onComplete: () => grain.destroy()
                });
            });
        }

        // Reduz speed do inimigo
        const origSpeed = enemy.speed;
        enemy.speed *= 0.4;
        this.scene.time.delayedCall(2500, () => { enemy.speed = origSpeed; });

        enemy.receberDano(105, this);

    }

    _ultimate_darkness(enemy) {

        // Escuridão total: cobrir tela de preto
        const veil = this.scene.add.rectangle(800, 450, 1600, 900, 0x000000, 0).setDepth(50);

        this.scene.tweens.add({
            targets: veil,
            alpha: 0.85,
            duration: 500,
            hold: 1500,
            yoyo: true,
            onComplete: () => veil.destroy()
        });

        // Orbes de trevas em espiral ao redor do inimigo
        for (let i = 0; i < 8; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.001;
                const orb = this.scene.add.circle(
                    enemy.sprite.x + Math.cos(angle) * 100,
                    enemy.sprite.y + Math.sin(angle) * 100,
                    22, 0x4b0082, 1
                ).setDepth(52);
                orb.setStrokeStyle(3, 0xda70d6, 1);

                this.scene.tweens.add({
                    targets: orb,
                    x: enemy.sprite.x,
                    y: enemy.sprite.y,
                    alpha: 0, scaleX: 0.2, scaleY: 0.2,
                    duration: 400,
                    onComplete: () => orb.destroy()
                });
            });
        }

        // Drenar vida para si mesmo
        const drain = 130;
        enemy.receberDano(drain, this);
        this.hp = Math.min(this.maxHp, this.hp + drain * 0.5);

    }

    _ultimate_sound(enemy) {

        // Explosão sônica - ondas concêntricas gigantes
        for (let i = 1; i <= 5; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const wave = this.scene.add.circle(800, 450, 10, 0xff69b4, 0).setDepth(25);
                wave.setStrokeStyle(6 - i, 0xff1493, 0.9);

                this.scene.tweens.add({
                    targets: wave,
                    scaleX: 100, scaleY: 100,
                    alpha: 0,
                    duration: 800,
                    ease: 'Expo.easeOut',
                    onComplete: () => wave.destroy()
                });
            });
        }

        // Stun e dano massivo
        enemy.aplicarStun(1500);
        enemy.receberDano(115, this);
        this.scene.cameras.main.shake(500, 0.02);

    }

    // ─────────────────── SISTEMAS DE STATUS ───────────────────

    receberDano(amount, attacker) {

        if (!this.isAlive || this.isInvincible) return;

        // Parry absorve o dano se ativo
        if (this.isParrying) {
            this.onSuccessfulParry(attacker);
            return;
        }

        this.hp -= amount;

        if (this.hp < 0) this.hp = 0;

        // Piscar de dano
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.2, duration: 80,
            yoyo: true, repeat: 2,
            onComplete: () => {
                if (this.sprite) this.sprite.setAlpha(1);
            }
        });

        // Texto de dano flutuante
        if (this.scene.damageSystem) {
            this.scene.damageSystem.showDamage(
                this.sprite.x, this.sprite.y,
                Math.round(amount)
            );
        }

        // Carregar ultimate com o dano recebido
        if (attacker) {
            attacker._chargeUltimate(GameConfig.ultimateChargePerDamage);
        }

        if (this.hp <= 0) {
            this._die();
        }

    }

    aplicarStun(duration) {

        this.isStunned = true;
        this.stunTimer = duration;

        // Visual de stun (estrelinhas sobre a cabeça)
        for (let i = 0; i < 4; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                const star = this.scene.add.circle(
                    this.sprite.x + Phaser.Math.Between(-25, 25),
                    this.sprite.y - 60,
                    8, 0xffff00, 1
                ).setDepth(30);
                this.scene.tweens.add({
                    targets: star, y: star.y - 20, alpha: 0,
                    duration: 300, onComplete: () => star.destroy()
                });
            });
        }

        this.sprite.setTint(0xaaaaff);
        this.scene.time.delayedCall(duration, () => {
            if (this.sprite) this.sprite.clearTint();
        });

    }

    aplicarGelo(duration) {

        this.isFrozen = true;
        this.frozenTimer = duration;
        this._freezeEffect = true;

        this.sprite.setTint(0x00e5ff);

        // Cristal sobre o personagem
        this.freezeOverlay = this.scene.add.circle(
            this.sprite.x, this.sprite.y,
            42, 0x00e5ff, 0.4
        ).setDepth(20);
        this.freezeOverlay.setStrokeStyle(4, 0xffffff, 0.9);

        this.scene.time.delayedCall(duration, () => {
            this._removeFreezeEffect();
        });

    }

    _removeFreezeEffect() {

        this.isFrozen = false;
        if (this.sprite) this.sprite.clearTint();
        if (this.freezeOverlay) {
            this.scene.tweens.add({
                targets: this.freezeOverlay, alpha: 0, scaleX: 1.5, scaleY: 1.5,
                duration: 300, onComplete: () => {
                    if (this.freezeOverlay) this.freezeOverlay.destroy();
                    this.freezeOverlay = null;
                }
            });
        }

    }

    _chargeUltimate(amount) {

        if (this.ultimateReady) return;

        this.ultimateCharge = Math.min(
            this.ultimateMaxCharge,
            this.ultimateCharge + amount
        );

        if (this.ultimateCharge >= this.ultimateMaxCharge) {
            this.ultimateReady = true;
            this._ultimateReadyEffect();
        }

    }

    _ultimateReadyEffect() {

        // Pulsar dourado quando ultimate pronta
        this.scene.tweens.add({
            targets: this.ring,
            scaleX: 1.5, scaleY: 1.5,
            alpha: 0.9,
            duration: 400, yoyo: true, repeat: 3,
            onComplete: () => {
                if (this.ring) {
                    this.ring.setScale(1);
                }
            }
        });

        const txt = this.scene.add.text(
            this.sprite.x, this.sprite.y - 80,
            'ULTIMATE PRONTA!',
            {
                fontSize: '16px',
                color: '#ffd700',
                fontFamily: 'Arial Black',
                stroke: '#000', strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(35);

        this.scene.tweens.add({
            targets: txt, y: txt.y - 40, alpha: 0,
            duration: 1500, ease: 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });

    }

    // ─────────────────── PARRY ───────────────────

    startParry() {

        const now = Date.now();
        if (now - this.lastParry < this.parryCooldown) return;
        this.lastParry = now;

        this.isParrying = true;

        this.parryShield.setFillStyle(0xffffff, 0.4);
        this.parryShield.setStrokeStyle(4, 0xffffff, 1);

        this.scene.time.delayedCall(GameConfig.parryWindow, () => {
            this.isParrying = false;
            this.parryShield.setFillStyle(0xffffff, 0);
            this.parryShield.setStrokeStyle(0, 0, 0);
        });

    }

    onSuccessfulParry(attacker) {

        this.isParrying = false;

        // Efeito de parry perfeito
        const flash = this.scene.add.circle(
            this.sprite.x, this.sprite.y,
            60, 0xffffff, 1
        ).setDepth(35);

        this.scene.tweens.add({
            targets: flash, scaleX: 3, scaleY: 3, alpha: 0,
            duration: 300, onComplete: () => flash.destroy()
        });

        // Stun no atacante
        if (attacker) {
            attacker.aplicarStun(GameConfig.parryStunDuration);
        }

    }

    // ─────────────────── DASH ───────────────────

    dash(dirX, dirY) {

        const now = Date.now();
        if (now - this.lastDash < this.dashCooldown) return;
        if (this.isDashing) return;

        this.lastDash = now;
        this.isDashing = true;
        this.isInvincible = true;
        this.dashTimer = GameConfig.dashDuration;

        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        this.dashVx = (dirX / len) * GameConfig.dashSpeed;
        this.dashVy = (dirY / len) * GameConfig.dashSpeed;

        // Rastro de dash
        const trail = this.scene.add.circle(
            this.sprite.x, this.sprite.y,
            35, this.data.cor, 0.6
        ).setDepth(8);

        this.scene.tweens.add({
            targets: trail, alpha: 0, scaleX: 0.5, scaleY: 0.5,
            duration: 250, onComplete: () => trail.destroy()
        });

    }

    _die() {

        this.isAlive = false;

        // Explosão de morte
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const piece = this.scene.add.circle(
                this.sprite.x + Math.cos(angle) * 20,
                this.sprite.y + Math.sin(angle) * 20,
                15, this.data.cor, 1
            ).setDepth(30);

            this.scene.tweens.add({
                targets: piece,
                x: piece.x + Math.cos(angle) * 200,
                y: piece.y + Math.sin(angle) * 200,
                alpha: 0, scaleX: 0.1, scaleY: 0.1,
                duration: 800, ease: 'Cubic.easeOut',
                onComplete: () => piece.destroy()
            });
        }

        this.scene.cameras.main.shake(600, 0.025);

        this.scene.tweens.add({
            targets: [this.sprite, this.aura, this.ring, this.label],
            alpha: 0, scaleX: 0.1, scaleY: 0.1,
            duration: 400, ease: 'Expo.easeIn'
        });

    }

    destroy() {

        this.sprite?.destroy();
        this.aura?.destroy();
        this.ring?.destroy();
        this.label?.destroy();
        this.parryShield?.destroy();
        this.freezeOverlay?.destroy();

    }

}