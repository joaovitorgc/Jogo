import Phaser from 'phaser';
import Player from '../entities/Player.js';
import HealthBar from '../ui/HealthBar.js';
import UltimateBar from '../ui/UltimateBar.js';
import ComboCounter from '../ui/ComboCounter.js';
import DamageText from '../ui/DamageText.js';
import Projectile from '../entities/Projectile.js';
import Arena from '../entities/Arena.js';
import ParticleManager from '../entities/ParticleManager.js';
import CollisionSystem from '../combat/CollisionSystem.js';
import DamageSystem from '../combat/DamageSystem.js';
import ComboSystem from '../combat/ComboSystem.js';
import DashSystem from '../combat/DashSystem.js';
import ParrySystem from '../combat/ParrySystem.js';
import GameConfig from '../config/GameConfig.js';
import CharacterConfig from '../config/CharacterConfig.js';

export default class BattleScene extends Phaser.Scene {

    constructor() {
        super('BattleScene');
    }

    create(data) {

        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        // ── Arena visual
        this.arena = new Arena(this, 'default');

        // ── Projéteis
        this.projectiles = [];
        this.ProjectileClass = Projectile;

        // ── Jogadores
        this.player1 = new Player(this, 300, H / 2, data.player1);
        this.player2 = new Player(this, W - 300, H / 2, data.player2);

        // Player 2 olha para esquerda
        this.player2.facingRight = false;

        // ── Sistemas
        this.particles = new ParticleManager(this);
        this.damageText = new DamageText(this);

        this.damageSystem = new DamageSystem(this);
        this.collisionSystem = new CollisionSystem(this);

        // ── UI: Barras de vida
        this.p1Bar = new HealthBar(this, 250, 42, 400, 28, this.player1.maxHp, 0x00ff88);
        this.p2Bar = new HealthBar(this, W - 250, 42, 400, 28, this.player2.maxHp, 0xff4444);
        this.p2Bar.setFlipped(true);

        // ── UI: Barras de ultimate
        this.p1UltBar = new UltimateBar(this, 250, 80, 400, 12, GameConfig.ultimateMaxCharge, 0x7b2fff, false);
        this.p2UltBar = new UltimateBar(this, W - 250, 80, 400, 12, GameConfig.ultimateMaxCharge, 0xff2f7b, true);

        // ── UI: Combos
        this.p1Combo = new ComboCounter(this, 250, 160, CharacterConfig[data.player1].cor);
        this.p2Combo = new ComboCounter(this, W - 250, 160, CharacterConfig[data.player2].cor);

        // ── Sistemas por jogador
        this.p1DashSystem  = new DashSystem(this, this.player1);
        this.p2DashSystem  = new DashSystem(this, this.player2);
        this.p1ParrySystem = new ParrySystem(this, this.player1);
        this.p2ParrySystem = new ParrySystem(this, this.player2);
        this.p1ComboSystem = new ComboSystem(this, this.player1, this.p1Combo);
        this.p2ComboSystem = new ComboSystem(this, this.player2, this.p2Combo);

        // Vincular comboSystem ao player para multiplicadores
        this.player1.comboSystem = this.p1ComboSystem;
        this.player2.comboSystem = this.p2ComboSystem;

        // ── Teclado
        this.keys = this.input.keyboard.addKeys({
            p1up:      'W',
            p1down:    'S',
            p1left:    'A',
            p1right:   'D',
            p1attack:  'F',
            p1special: 'G',
            p1dash:    'Q',
            p1parry:   'E',
            p1ultimate:'R',

            p2up:      'UP',
            p2down:    'DOWN',
            p2left:    'LEFT',
            p2right:   'RIGHT',
            p2attack:  'ENTER',
            p2special: 'SHIFT',
            p2dash:    'NUMPAD_0',
            p2parry:   'NUMPAD_1',
            p2ultimate:'NUMPAD_2'
        });

        // ── Timer de round
        this.roundTime = GameConfig.roundTime;
        this.roundEnded = false;

        this._buildHUD(W, H);
        this._startRoundTimer();

        // ── Fade de entrada
        this.cameras.main.fadeIn(600);

        // ── Texto de início
        this._showRoundStart();

    }

    _buildHUD(W, H) {

        // Nomes dos personagens
        const cfg1 = CharacterConfig[this.player1.element];
        const cfg2 = CharacterConfig[this.player2.element];

        this.add.text(60, 38, cfg1.nome, {
            fontSize: '20px', fontFamily: 'Arial Black',
            color: `#${cfg1.cor.toString(16).padStart(6,'0')}`,
            stroke: '#000', strokeThickness: 3
        }).setDepth(65);

        this.add.text(W - 60, 38, cfg2.nome, {
            fontSize: '20px', fontFamily: 'Arial Black',
            color: `#${cfg2.cor.toString(16).padStart(6,'0')}`,
            stroke: '#000', strokeThickness: 3
        }).setOrigin(1, 0).setDepth(65);

        // Timer central
        this.timerText = this.add.text(W / 2, 45, '99', {
            fontSize: '52px', fontFamily: 'Arial Black',
            color: '#ffffff',
            stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(65);

        // Separador VS
        this.add.text(W / 2, 90, 'VS', {
            fontSize: '16px', fontFamily: 'Arial Black',
            color: '#888888', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(65);

        // Labels dos controles (P1)
        this._buildControlLabels(W, H);

    }

    _buildControlLabels(W, H) {

        const style = { fontSize: '11px', color: '#555555', fontFamily: 'Arial' };

        // P1 controls
        this.add.text(10, H - 80, 'P1: WASD=Mover | F=Ataque | G=Especial | R=Ultimate | Q=Dash | E=Parry', style).setDepth(65);

        // P2 controls
        this.add.text(W - 10, H - 80,
            'P2: ↑↓←→=Mover | Enter=Ataque | Shift=Especial | Num2=Ultimate | Num0=Dash | Num1=Parry',
            { ...style }
        ).setOrigin(1, 0).setDepth(65);

    }

    _startRoundTimer() {

        this.roundTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.roundEnded) return;

                this.roundTime--;
                this.timerText.setText(String(this.roundTime));

                if (this.roundTime <= 10) {
                    this.timerText.setColor('#ff4444');
                }

                if (this.roundTime <= 0) {
                    this._timeOut();
                }
            },
            repeat: GameConfig.roundTime - 1
        });

    }

    _showRoundStart() {

        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        const txt = this.add.text(W / 2, H / 2, 'LUTA!', {
            fontSize: '96px', fontFamily: 'Arial Black',
            color: '#ffffff', stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(80).setAlpha(0);

        this.tweens.add({
            targets: txt,
            alpha: 1, scaleX: 1.3, scaleY: 1.3,
            duration: 200, yoyo: true, hold: 400,
            onComplete: () => {
                this.tweens.add({
                    targets: txt, alpha: 0, y: H / 2 - 80,
                    duration: 400, onComplete: () => txt.destroy()
                });
            }
        });

    }

    _timeOut() {

        // Vitória por HP
        if (this.player1.hp > this.player2.hp) {
            this._endRound('P1', this.player1);
        } else if (this.player2.hp > this.player1.hp) {
            this._endRound('P2', this.player2);
        } else {
            this._endRound('EMPATE', null);
        }

    }

    _endRound(winner, winnerPlayer) {

        if (this.roundEnded) return;
        this.roundEnded = true;

        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        const label = winner === 'EMPATE' ? 'EMPATE!' : `${winner} VENCEU!`;
        const color = winner === 'P1' ? '#00ff88' : winner === 'P2' ? '#ff4444' : '#ffcc00';

        // Overlay escuro
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
            .setDepth(90);
        this.tweens.add({ targets: overlay, alpha: 0.6, duration: 500 });

        // Texto de vitória
        const winTxt = this.add.text(W / 2, H / 2, label, {
            fontSize: '80px', fontFamily: 'Arial Black',
            color, stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(100).setScale(0.5, 0.5);

        this.tweens.add({
            targets: winTxt,
            scaleX: 1, scaleY: 1,
            duration: 400, ease: 'Back.easeOut'
        });

        // Explosão de partículas na posição do vencedor
        if (winnerPlayer) {
            this.particles.explosion(
                winnerPlayer.sprite.x,
                winnerPlayer.sprite.y,
                winnerPlayer.data.cor,
                20, 100
            );

            // Shake na derrota
            this.cameras.main.shake(500, 0.02);
        }

        // Voltar para seleção após 3.5s
        this.time.delayedCall(3500, () => {
            this.cameras.main.fadeOut(600);
            this.time.delayedCall(600, () => {
                this.scene.start('CharacterSelectScene');
            });
        });

    }

    // ─────────────────── UPDATE PRINCIPAL ───────────────────

    update() {

        if (this.roundEnded) return;

        const k = this.keys;

        // ── Mover jogadores
        this.player1.update(k, true);
        this.player2.update(k, false);

        // ── Colisão entre jogadores
        this.collisionSystem.resolvePlayerOverlap(this.player1, this.player2);

        // ── Ataques normais
        if (Phaser.Input.Keyboard.JustDown(k.p1attack)) {
            const inRange = this.collisionSystem.checkMeleeRange(this.player1, this.player2);
            if (inRange) {
                this.player1.attack(this.player2);
                this.p1ComboSystem.registerHit();
            }
        }

        if (Phaser.Input.Keyboard.JustDown(k.p2attack)) {
            const inRange = this.collisionSystem.checkMeleeRange(this.player2, this.player1);
            if (inRange) {
                this.player2.attack(this.player1);
                this.p2ComboSystem.registerHit();
            }
        }

        // ── Ataques especiais (projéteis)
        if (Phaser.Input.Keyboard.JustDown(k.p1special)) {
            this.player1.specialAttack();
        }

        if (Phaser.Input.Keyboard.JustDown(k.p2special)) {
            this.player2.specialAttack();
        }

        // ── Ultimates
        if (Phaser.Input.Keyboard.JustDown(k.p1ultimate)) {
            this.player1.ultimate(this.player2);
        }

        if (Phaser.Input.Keyboard.JustDown(k.p2ultimate)) {
            this.player2.ultimate(this.player1);
        }

        // ── Dash
        if (Phaser.Input.Keyboard.JustDown(k.p1dash)) {
            const dirX = k.p1right.isDown ? 1 : k.p1left.isDown ? -1 : (this.player1.facingRight ? 1 : -1);
            const dirY = k.p1up.isDown ? -1 : k.p1down.isDown ? 1 : 0;
            this.p1DashSystem.executeDash(dirX, dirY || 0);
        }

        if (Phaser.Input.Keyboard.JustDown(k.p2dash)) {
            const dirX = k.p2right.isDown ? 1 : k.p2left.isDown ? -1 : (this.player2.facingRight ? 1 : -1);
            const dirY = k.p2up.isDown ? -1 : k.p2down.isDown ? 1 : 0;
            this.p2DashSystem.executeDash(dirX, dirY || 0);
        }

        // ── Parry
        if (Phaser.Input.Keyboard.JustDown(k.p1parry)) {
            this.p1ParrySystem.startParry();
        }

        if (Phaser.Input.Keyboard.JustDown(k.p2parry)) {
            this.p2ParrySystem.startParry();
        }

        // ── Colisão de projéteis
        this.collisionSystem.checkProjectiles(
            this.projectiles,
            this.player1,
            this.player2
        );

        // ── Atualizar projéteis
        for (const proj of [...this.projectiles]) {
            proj.update();
        }

        // ── Atualizar UI
        this.p1Bar.update(this.player1.hp);
        this.p2Bar.update(this.player2.hp);
        this.p1UltBar.update(this.player1.ultimateCharge);
        this.p2UltBar.update(this.player2.ultimateCharge);

        // ── Verificar morte
        if (this.player1.hp <= 0 && !this.roundEnded) {
            this.player1._die();
            this._endRound('P2', this.player2);
        }

        if (this.player2.hp <= 0 && !this.roundEnded) {
            this.player2._die();
            this._endRound('P1', this.player1);
        }

    }

}