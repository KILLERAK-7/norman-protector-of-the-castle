import * as sprites from "./sprites.json";
import { canvas, clear, ctx, drawSceneSprite, drawSprite, particleEmitters, Sprite, write } from "./engine";
import { Point, randomInt } from "./helpers";
import { SHOPPING } from "./game";
import { shop } from "./shop";

const ICON_SOULS = "\x01";
const ICON_HEALTH = "\x03";
const ICON_CASTS = "\x04";
const ICON_ARROW_RIGHT = "\x9D";

let screenShakeTimer = 0;

export function screenshake(time: number) {
  screenShakeTimer = time;
}

let sceneOrigin = Point(0, 150);

export function screenToSceneCoords(x: number, y: number): Point {
  let r = canvas.getBoundingClientRect();
  let sx = (x - r.x) * (canvas.width / r.width) | 0;
  let sy = (y - r.y) * (canvas.height / r.height) | 0;
  return { x: sx, y: sceneOrigin.y - sy };
}

export function render(dt: number) {
  clear();
  ctx.save();

  if (screenShakeTimer > 0) {
    screenShakeTimer -= dt;
    ctx.translate(randomInt(2), randomInt(2));
  }

  ctx.translate(sceneOrigin.x, sceneOrigin.y);
  drawBackground();
  drawParticles();
  drawObjects();
  drawReticle();
  ctx.restore();

  drawHud();

  if (game.state === SHOPPING) {
    drawShop();
  }
}

function drawShop() {
  ctx.save();
  ctx.translate(100, 20);
  write("Necronomicon\n", 0, 0);
  write("~~-~--~~~-~~\n");
  let selected = shop.items[shop.selectedIndex];
  for (let item of shop.items) {
    write(
      `${item === selected ? ICON_ARROW_RIGHT : " "} ${
        item.name
      } ${ICON_SOULS}${item.cost}\n`,
    );
  }
  write("~~-~--~~~-~~\n");
  write(selected?.description + "\n");
  write("~~-~--~~~-~~\n");
  ctx.restore();
}

function drawHud() {
  drawSprite(sprites.norman_icon, 0, 0);

  for (let i = 0; i < game.player.maxHp; i++) {
    let sprite = i < game.player.hp ? sprites.health_orb : sprites.health_orb_empty;
    drawSprite(sprite, 11 + i * 4, 0);
  }

  for (let i = 0; i < game.spell.maxCasts; i++) {
    let sprite = i < game.spell.casts ? sprites.cast_orb : sprites.cast_orb_empty;
    drawSprite(sprite, 11 + i * 4, 6);
  }

  write(`${ICON_SOULS}${game.souls}`, 0, 13);
}

function drawOrbs(
  x: number,
  y: number,
  value: number,
  maxValue: number,
  sprite: Sprite,
  emptySprite: Sprite,
) {
  let x0 = x - (maxValue * 4) / 2;
  for (let i = 0; i < maxValue; i++) {
    drawSceneSprite(i < value ? sprite : emptySprite, x0 + i * 4, y);
  }
}

function drawObjects() {
  for (let object of game.objects) {
    drawSceneSprite(object.sprite, object.x, object.y + object.hop);

    if (object.maxHp === 1 || object === game.player) continue;

    if (object.maxHp < 10) {
      let { x } = object.center();
      drawOrbs(x, -6, object.hp, object.maxHp, sprites.health_orb, sprites.health_orb_empty);
    } else {
      drawSceneSprite(sprites.health_orb, object.x, -10);
      write(`${object.hp}/${object.maxHp}`, object.x + 6, 4);
    }
  }
}

function drawBackground() {
  for (let i = 0; i < game.stage.width / 16; i++) {
    drawSceneSprite(sprites.wall, i * 16, 0);
    drawSceneSprite(sprites.floor, i * 16, -sprites.floor[3]);
    drawSceneSprite(sprites.ceiling, i * 16, game.stage.ceiling);
  }
}

function drawReticle() {
  let { x, y } = game.getCastingPoint();
  let sprite = sprites.reticle;
  drawSceneSprite(sprite, x - sprite[2] / 2, y - sprite[3] / 2);
}

function drawParticles() {
  for (let emitter of particleEmitters) {
    for (let particle of emitter.particles) {
      let variant = emitter.variants[particle.variant];
      let progress = particle.elapsed / particle.duration;
      let sprite = variant[progress * variant.length | 0];
      drawSceneSprite(sprite, particle.x, particle.y);
    }
  }
}
