/// Prince game
/// Date: 17-Aug-24

/// Multi screen game

let canvas: any;
let ctx: any;

let player: Player;
let platforms: Platform[];

/// The possible moving states a player can have
enum Moves {
    Stopped,
    Up,
    Down,
    Left,
    Right,
};

document.addEventListener("DOMContentLoaded", Initialize);
document.addEventListener("keydown", MovePlayer);
document.addEventListener("keyup", StopPlayer);

class Platform {
    position: { x: number; y: number; };
    width: number;
    height: number;
    color: string;
    constructor(x: number, y: number, width: number, height: number) {
        this.position = { x, y };

        this.width = width
        this.height = height;
        this.color = "seagreen";
    }

    update() {
        this.draw();
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

}

class Player {
    velocity: { x: number; y: number; };
    position: { x: number; y: number; };
    width: number;
    height: number;
    gravity: number;
    moveXDirection: Moves;
    jumpHeight: number;
    canJump: boolean;

    constructor() {
        this.position = {
            x: 100,
            y: 100,
        };

        this.velocity = {
            x: 10,
            y: 5,
        };

        this.gravity = 1;

        this.width = 50;
        this.height = 30;

        this.moveXDirection = Moves.Stopped;

        this.canJump = false;
        this.jumpHeight = 30;
    }

    update() {
        this.animate();
        this.draw();
    }

    detectCollision() {
        // If the player touches the ground, set its y velocity to be 0
        if (this.position.y + this.height >= canvas.height) {
            this.position.y = canvas.height - this.height;
            this.velocity.y = 0;

            this.canJump = true;
        }
        else {
            this.canJump = false;
        }

        // Collision with the platforms
        for (const platform of platforms) {
            if (this.position.x < platform.position.x + platform.width
                    && this.position.x + this.width > platform.position.x
                    && this.position.y + this.velocity.y
                        < platform.position.y + platform.height
                    && this.position.y + this.velocity.y + this.height
                        > platform.position.y) {

                // Checking from which side it collided

                // Distance from player's right edge to platform's left edge
                let deltaLeft = this.position.x + this.width - platform.position.x;

                // Distance from platform's right edge tp player's left edge
                let deltaRight = platform.position.x + platform.width - this.position.x;

                // Distance from player's bottom edge to platform's top edge
                let deltaTop = this.position.y + this.height - platform.position.y;

                // Distance from platform's bottom edge to player's top edge
                let deltaBottom = platform.position.y + platform.width - this.position.y;

                let minDelta = Math.min(deltaLeft, deltaRight, deltaBottom, deltaTop);

                switch (minDelta) {
                    case deltaLeft:
                        // Colliding from left
                        this.position.x = platform.position.x - this.width;
                        break;
                    case deltaRight:
                        // Colliding from right
                        this.position.x = platform.position.x + platform.width;
                        break;
                    case deltaTop:
                        this.velocity.y = 0;
                        this.canJump = true;
                        this.position.y = platform.position.y - this.height;
                        break;
                    case deltaBottom:
                        this.velocity.y = 0;
                        this.position.y = platform.position.y + platform.height;
                        break;
                }

            }
        }



    }

    animate() {
        this.position.y += this.velocity.y;
        this.velocity.y += this.gravity;


        if (this.moveXDirection === Moves.Left) {
            this.position.x -= this.velocity.x;
        }
        else if (this.moveXDirection === Moves.Right) {
            this.position.x += this.velocity.x;
        }

        this.detectCollision();
    }

    move(moveDirection: Moves) {
        switch (moveDirection) {
            case Moves.Left:
                this.moveXDirection = Moves.Left;
                break;
            case Moves.Right:
                this.moveXDirection = Moves.Right;
                break;
            case Moves.Up:
                this.jump();
                break;
            case Moves.Stopped:
                this.moveXDirection = Moves.Stopped;
                break;
        }
    }
    jump() {
        if (this.canJump) {
            this.velocity.y = -this.jumpHeight;
        }
    }


    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

}

/// Runs the initialization procedure as soon as the page loads up
function Initialize() {
    SetupCanvas();
    InitializeObjects();

    Draw();
    GameLoop();
}

/// Setups the canvas so that we can draw on it
function SetupCanvas() {
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    canvas = document.querySelector("canvas");
    if (canvas === null) {
        throw new Error("Canvas not found in html page");
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx = canvas.getContext("2d");
}

/// Creates objects like player, platforms, etc. which will be eventually drawn
/// on the screen.
function InitializeObjects() {
    player = new Player();
    
    platforms = new Array();
    for (let i = 0; i < 10; i++) {
        platforms.push(new Platform(200 + i * 100, canvas.height - 300, 100, 100));
    }
}

/// The function where all the animation & drawing will happen
function Draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.update();
    for (let platform of platforms) {
        platform.update();
    }
}

function GameLoop() {
    Draw();

    window.requestAnimationFrame(GameLoop);
}

/// Event handler function triggered on press of a button, which will take care
/// of moving the player
function MovePlayer(this: Document, event: KeyboardEvent) {
    switch(event.key) {
        case "ArrowLeft":
            player.move(Moves.Left);
            break;
        case "ArrowRight":
            player.move(Moves.Right);
            break;
        case "ArrowUp":
            player.move(Moves.Up);
            break;
    }
}

/// Event handler function triggered on release of a button, which will take
/// care of stopping the player
function StopPlayer(this: Document, event: KeyboardEvent) {
    // TODO: Properly implement this
    switch(event.key) {
        case "ArrowLeft":
            player.move(Moves.Stopped);
            break;
        case "ArrowRight":
            player.move(Moves.Stopped);
            break;
    }
}

