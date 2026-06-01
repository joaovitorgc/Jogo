const ArenaConfig = {

    default: {
        id: 'default',
        nome: 'NEXUS',
        bgColor: 0x101820,
        floorColor: 0x1a2030,
        floorY: 820,
        floorHeight: 80,
        leftWall: 60,
        rightWall: 1540,
        ceiling: 60,

        // Elementos decorativos da arena
        ambientColor: 0x00ffff,
        glowIntensity: 0.3,

        // Limites de movimento dos jogadores
        boundsLeft: 80,
        boundsRight: 1520,
        boundsTop: 80,
        boundsBottom: 830
    },

    volcanic: {
        id: 'volcanic',
        nome: 'VULCÃO',
        bgColor: 0x1a0800,
        floorColor: 0x3d1200,
        floorY: 820,
        floorHeight: 80,
        leftWall: 60,
        rightWall: 1540,
        ceiling: 60,
        ambientColor: 0xff4500,
        glowIntensity: 0.5,
        boundsLeft: 80,
        boundsRight: 1520,
        boundsTop: 80,
        boundsBottom: 830
    }

};

export default ArenaConfig;