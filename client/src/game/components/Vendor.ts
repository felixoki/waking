import { ComponentName, VendorConfig } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class VendorComponent extends Component {
  private entity: Entity;
  public config: VendorConfig;

  public name = ComponentName.VENDOR;

  constructor(entity: Entity, config: VendorConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {}

  update(): void {}

  detach(): void {}
}
