import { Component, HostListener, ViewChild } from "@angular/core";
import { DndDropEvent } from "ngx-drag-drop";
import * as shape from "d3-shape";
import { Shape } from "../Shape";
import {
  Edge,
  Node,
  ClusterNode,
  Layout,
  NodePosition,
  GraphComponent
} from "@swimlane/ngx-graph";
@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  shapesToDraw: Shape[] = [];
  shapeType = "line";
  name = "Angular";
  hierarchialGraph = { nodes: [], links: [] };
  curve = shape.curveLinear;
  AllEvents = [];
  previousevent;
  previouseventdd;
  startNode;
  endNode;
  click: number = 0;
  createdShape: Shape;
  isDragging = false;
  draggingNode = null;
  startingDragPosition;
  currentDragPosition;
  mouseOverNode;
  public fruits: string[] = ["Normal", "Webhook", "TopicSearch", "ModelSearch"];
  @ViewChild("graph", { static: false }) graphEl: GraphComponent;

  public apples: string[] = [];
  public bananas: string[] = [];
  showGraph() {
    this.hierarchialGraph.nodes = [];
    this.hierarchialGraph.links = [];
  }

  onClick(event) {
    if (this.click === 0) {
      this.previousevent = event;
      event.color = "#d26767";
      this.click += 1;
    } else if (this.click === 1) {
      if (this.previousevent.id !== event.id) {
        const obj = {
          source: this.previousevent.id,
          target: event.id
        };
        var data = this.hierarchialGraph.links.find(
          c => c.source == obj.source && c.target === obj.target
        );
        if (data === undefined) {
          this.hierarchialGraph.links.push(obj);
          this.hierarchialGraph.links = [...this.hierarchialGraph.links];
        }
        this.click = 0;
      } else {
        var index = this.hierarchialGraph.nodes.indexOf(
          this.hierarchialGraph.nodes.find(
            c => c.label == event.label && c.id === event.id
          )
        );
        if (index > -1) {
          this.hierarchialGraph.nodes.splice(index, 1);
          this.hierarchialGraph.nodes = [...this.hierarchialGraph.nodes];

          var RemoveLinks = this.hierarchialGraph.links.filter(
            c => c.source === event.id || c.target === event.id
          );

          this.hierarchialGraph.links = this.hierarchialGraph.links.filter(
            value => !RemoveLinks.includes(value)
          );
          this.hierarchialGraph.links = [...this.hierarchialGraph.links];

          this.click = 0;
        }
      }
    }
    console.log("onclick" + event);
  }

  RemoveLink(event) {
    console.log(event);
    var RemoveLinkindex = this.hierarchialGraph.links.indexOf(
      this.hierarchialGraph.links.find(
        c => c.source === event.source && c.target === event.target
      )
    );

    this.hierarchialGraph.links.splice(RemoveLinkindex, 1);

    this.hierarchialGraph.links = [...this.hierarchialGraph.links];
  }

  onDragged(item: any, list: any[]) {
    const index = list.indexOf(item);
  }

  onDrop(event: DndDropEvent, list: any[]) {
    debugger;

    this.AllEvents.push(event);

    let index = event.index;
    console.log(event.event);
    if (typeof index === "undefined") {
      index = list.length;
    }

    if (this.previouseventdd === undefined) {
      var data = {
        id: "start",
        label: event.data,
        color: "#e2e2e2",
        dimension: { width: "130", height: "40" }
      };

      var data1 = {
        source: "start",
        target: "2"
      };
    } else {
      if (this.previouseventdd.id === "start") {
        data = {
          id: "2",
          label: event.data,
          color: "#e2e2e2"
        };

        data1 = {
          source: "start",
          target: "2"
        };
      } else {
        if (this.hierarchialGraph.nodes.length === 3) {
          data = {
            id: "1000",
            label: event.data,
            color: "#e2e2e2"
          };

          data1 = {
            source: parseInt(this.previouseventdd.id).toString(),
            target: "1000"
          };
        } else {
          data = {
            id: (parseInt(this.previouseventdd.id) + 1).toString(),
            label: event.data,
            color: "#e2e2e2"
          };

          data1 = {
            source: parseInt(this.previouseventdd.id).toString(),
            target: (parseInt(this.previouseventdd.id) + 1).toString()
          };
        }
      }
    }

    this.hierarchialGraph.nodes.push(data);
    if (this.hierarchialGraph.nodes.length > 1) {
      if (
        this.hierarchialGraph.nodes.find(c => c.id === this.previouseventdd.id)
      ) {
        //     this.hierarchialGraph.links.push(data1);
      }
    }
    this.previouseventdd = data;
    this.hierarchialGraph.nodes = [...this.hierarchialGraph.nodes];
    this.hierarchialGraph.links = [...this.hierarchialGraph.links];
    console.log(JSON.stringify(this.hierarchialGraph));
    list.splice(index, 0, event.data);
  }
  onmouseup() {
    this.isDragging = false;
    this.draggingNode = undefined;
  }
  onmousedown(evt, node) {
    this.startNode = node;
    this.createdShape = {
      type: this.shapeType,
      x: evt.offsetX,
      y: evt.offsetY,
      w: 0,
      h: 0
    };
    this.shapesToDraw.push(this.createdShape);
    console.log("down" + JSON.stringify(node));
  }
  onNodeCircleMouseDown(event: any, node): void {
    console.log("node");

    this.isDragging = true;
    this.draggingNode = node;
    this.startNode = node;
    this.startingDragPosition = {
      x: (event.layerX - this.graphEl.panOffsetX) / this.graphEl.zoomLevel,
      y: (event.layerY - this.graphEl.panOffsetY) / this.graphEl.zoomLevel
    };

    this.currentDragPosition = {
      x: node.position.x + node.dimension.width / 2,
      y: node.position.y
    };
    event.parentNode.appendChild(event);
    setTimeout(() => {
      this.mouseOverNode = undefined;
    });
  }
  /**
   * On mouse up event
   *
   */
  @HostListener("document:mousemove", ["$event"])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }
    this.currentDragPosition.x += event.movementX / this.graphEl.zoomLevel;
    this.currentDragPosition.y += event.movementY / this.graphEl.zoomLevel;
  }

  /**
   * On mouse up event
   *
   */
  onMouseUp(event, node): void {
    if (this.isDragging && this.draggingNode) {
      // logic if mouse is released over another node
      this.endNode = node;
      let link = {
        source: this.startNode.id,
        target: this.endNode.id
      };
      this.hierarchialGraph.links.push(link);
      console.log(JSON.stringify(this.hierarchialGraph));
      this.createdShape = null;
      this.hierarchialGraph.links = [...this.hierarchialGraph.links];
    }
    this.isDragging = false;
    this.draggingNode = undefined;
  }
}
