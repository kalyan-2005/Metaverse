import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

class MainScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  cameraZoom = 0.5;

  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image("tiles", "/assets/thumbnail.png");
    this.load.tilemapTiledJSON("map", "/assets/mapp.json");
    this.load.spritesheet("player", "/assets/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("object", "/assets/object.png");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("tileset1", "tiles");
    const ground = map.createLayer("Ground", tileset);
    const walls = map.createLayer("Walls", tileset);

    walls?.setCollisionBetween(1, 3078); // Ensure all solid tiles are in this range

    // Optional: visual debug
    // walls?.renderDebug(this.add.graphics(), {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(255, 0, 0, 100),
    //   faceColor: new Phaser.Display.Color(0, 255, 0, 100),
    // });

    this.player = this.physics.add.sprite(300, 500, "player");
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.physics.add.collider(this.player, walls);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.cameraZoom);

    // Drag camera
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      if (pointer.rightButtonDown()) {
        this.cameras.main.scrollX -=
          (pointer.x - pointer.prevPosition.x) / this.cameraZoom;
        this.cameras.main.scrollY -=
          (pointer.y - pointer.prevPosition.y) / this.cameraZoom;
      }
    });

    // Zoom controls
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      this.cameraZoom = this.cameraZoom = screenHeight / mapPixelHeight;
      this.cameras.main.setZoom(this.cameraZoom);
    });

    // Drag-n-drop object
    const draggableObject = this.physics.add
      .image(200, 200, "object")
      .setInteractive();
    this.input.setDraggable(draggableObject);

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    // Drag camera with right-click
this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
  if (pointer.rightButtonDown()) {
    // Disable camera follow while dragging
    this.cameraFollowingPlayer = false;
    this.cameras.main.stopFollow();
  }
});

this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
  if (!pointer.isDown) return;
  if (pointer.rightButtonDown()) {
    this.cameras.main.scrollX -=
      (pointer.x - pointer.prevPosition.x) / this.cameraZoom;
    this.cameras.main.scrollY -=
      (pointer.y - pointer.prevPosition.y) / this.cameraZoom;
  }
});

this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
  if (pointer.rightButtonReleased()) {
    // Optionally: Re-enable camera follow
    this.cameraFollowingPlayer = true;
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }
});
// Drag camera with right-click
this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
  if (pointer.rightButtonDown()) {
    // Disable camera follow while dragging
    this.cameraFollowingPlayer = false;
    this.cameras.main.stopFollow();
  }
});

this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
  if (!pointer.isDown) return;
  if (pointer.rightButtonDown()) {
    this.cameras.main.scrollX -=
      (pointer.x - pointer.prevPosition.x) / this.cameraZoom;
    this.cameras.main.scrollY -=
      (pointer.y - pointer.prevPosition.y) / this.cameraZoom;
  }
});

this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
  if (pointer.rightButtonReleased()) {
    // Optionally: Re-enable camera follow
    this.cameraFollowingPlayer = true;
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }
});

  }

  update() {
    const speed = 150;
  const body = this.player.body as Phaser.Physics.Arcade.Body;

  body.setVelocity(0);
  if (this.cursors.left?.isDown) body.setVelocityX(-speed);
  else if (this.cursors.right?.isDown) body.setVelocityX(speed);
  if (this.cursors.up?.isDown) body.setVelocityY(-speed);
  else if (this.cursors.down?.isDown) body.setVelocityY(speed);

  this.player.anims.play("walk", true);
  
  }
}

function Playground() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [phaserInstance, setPhaserInstance] = useState<Phaser.Game | null>(
    null
  );

  useEffect(() => {
    if (gameRef.current && !phaserInstance) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
        scene: MainScene,
        parent: gameRef.current,
      };

      const game = new Phaser.Game(config);
      setPhaserInstance(game);

      return () => game.destroy(true);
    }
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={gameRef} className="w-full h-full" />
    </div>
  );
}

export default Playground;
