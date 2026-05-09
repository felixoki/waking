import { PipelineName } from "@server/types";
import { getIlluminateFrag } from "./frags/illuminate";

const PostFXPipeline = Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;

export class IlluminatePipeline extends PostFXPipeline {
  constructor(game: Phaser.Game) {
    super({
      name: PipelineName.ILLUMINATE,
      game: game,
      renderTarget: true,
      fragShader: getIlluminateFrag(),
    });
  }
}
