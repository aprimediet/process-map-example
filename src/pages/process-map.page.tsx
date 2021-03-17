import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'antd';
import { withRouter } from 'react-router-dom';
import { Graph, IG6GraphEvent, IGroup, IShape, Item } from '@antv/g6-pc';
import G6 from '@antv/g6';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ProcessMap extends PureComponent<any, any> {
  private graph: Graph | undefined = undefined;
  private graphRef = React.createRef<HTMLDivElement>();

  state = {
    processes: {
      id: 'apache1',
      pid: 3476,
      processName: 'Apache',
      port: 80,
      connections: 123,
      notificationCount: 10,
      collapsed: false,
      children: [
        {
          id: 'postgres1',
          pid: 7689,
          processName: 'PostgreSQL',
          port: 5432,
          connections: 5,
          notificationCount: 6,
          collapsed: false,
          children: [
            {
              id: 'apache2',
              pid: 9876,
              processName: 'Apache',
              port: 80,
              connections: 3,
              notificationCount: 20,
              collapsed: false,
            },
            {
              id: 'tomcat1',
              pid: 2243,
              processName: 'Tomcat',
              port: 8081,
              connections: 10,
              notificationCount: 1,
              collapsed: false,
            },
          ],
        },
        {
          id: 'mariadb1',
          pid: 678,
          processName: 'MariaDB',
          port: 3306,
          connections: 3,
          notificationCount: 12,
          collapsed: false,
        },
        {
          id: 'iis1',
          pid: 1233,
          processName: 'IIS',
          port: 8080,
          connections: 1,
          notificationCount: 2,
          collapsed: false,
        },
      ],
    },
  };

  componentDidMount(): void {
    this.registerNodeType();
    this.graphInitialize();
    this.graphRegisterEvents();
  }

  graphInitialize = (): void => {
    // eslint-disable-next-line react/no-find-dom-node
    const container = ReactDOM.findDOMNode(this.graphRef.current) as HTMLElement;
    const width = window.innerWidth;
    const height = window.innerHeight - 128;

    this.graph = new G6.TreeGraph({
      container,
      width,
      height,
      modes: {
        default: ['drag-canvas'],
      },
      fitView: true,
      animate: true,
      defaultNode: {
        type: 'flow-rect',
      },
      defaultEdge: {
        type: 'cubic-horizontal',
        style: {
          stroke: '#CED4D9',
        },
      },
      layout: {
        type: 'indented',
        direction: 'LR',
        dropCap: false,
        indent: 300,
        getHeight(): number {
          return 60;
        },
      },
    });

    this.graph.data(Object.assign({}, this.state.processes));
    this.graph.render();
  };

  registerNodeType = (): void => {
    G6.registerNode(
      'flow-rect',
      {
        shapeType: 'flow-rect',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        draw(cfg?: any, group?: IGroup): IShape {
          const { id, pid, processName, port, connections, collapsed } = cfg;

          const grey = '#CED4D9';

          const nodeOrigin = {
            x: -120 / 2,
            y: -60 / 2,
          };

          const wrapper = group?.addShape('rect', {
            attrs: {
              ...nodeOrigin,
              width: 120,
              height: 60,
              lineWidth: 1,
              fontSize: 8,
              fill: '#FFF',
              radius: 2,
              stroke: grey,
              opacity: 1,
            },
          });

          // const wrapperBBox = wrapper?.getBBox();

          // Label container
          const labelContainer = group?.addShape('rect', {
            attrs: {
              x: nodeOrigin.x,
              y: nodeOrigin.y,
              width: 120,
              height: 16,
              lineWidth: 1,
              fontSize: 8,
              radius: 2,
              fill: '#F8AB4C',
              opacity: 1,
            },
            name: 'pid-container-shape',
          });

          // PID Text
          group?.addShape('text', {
            attrs: {
              x: nodeOrigin.x + 8,
              y: labelContainer?.getBBox().maxY - 4,
              text: `PID: ${pid} (${processName})`,
              fontSize: 8,
              opacity: 0.85,
              fill: '#000',
              cursor: 'pointer',
              textAlign: 'left',
              textBaseline: 'bottom',
            },
            name: 'pid-shape',
          });

          // Port Text
          const portText = group?.addShape('text', {
            attrs: {
              x: nodeOrigin.x + 8,
              y: labelContainer?.getBBox().maxY + 16,
              text: `Port: ${port}`,
              fontSize: 8,
              opacity: 0.85,
              fill: '#000',
              cursor: 'pointer',
              textAlign: 'left',
              textBaseline: 'bottom',
            },
            name: 'port-shape',
          });

          // Connection Text
          group?.addShape('text', {
            attrs: {
              x: nodeOrigin.x + 8,
              y: portText?.getBBox().maxY + 16,
              text: `Connections: ${connections}`,
              fontSize: 8,
              opacity: 0.85,
              fill: '#000',
              cursor: 'pointer',
              textAlign: 'left',
              textBaseline: 'bottom',
            },
            name: 'connection-shape',
          });

          // collapse rect
          if (cfg.children && cfg.children.length) {
            group?.addShape('rect', {
              attrs: {
                x: 120 / 2 - 4,
                y: -4,
                width: 8,
                height: 8,
                stroke: 'rgba(0, 0, 0, 0.25)',
                cursor: 'pointer',
                fill: '#fff',
              },
              name: 'collapse-back',
              modelId: id,
            });

            // collpase text
            group?.addShape('text', {
              attrs: {
                x: 120 / 2,
                y: 0,
                textAlign: 'center',
                textBaseline: 'middle',
                text: collapsed ? '+' : '-',
                fontSize: 8,
                cursor: 'pointer',
                fill: 'rgba(0, 0, 0, 0.25)',
              },
              name: 'collapse-text',
              modelId: cfg.id,
            });
          }

          // this.drawLinkPoints(cfg, group);

          return wrapper as IShape;
        },
        setState(name?: string, value?: string | boolean, item?: Item): void {
          if (name === 'collapse') {
            const group = item?.getContainer();

            const collapseText = group?.find((e) => e.get('name') === 'collapse-text');

            if (collapseText) {
              if (!value) {
                collapseText.attr({
                  text: '-',
                });
              } else {
                collapseText.attr({
                  text: '+',
                });
              }
            }
          }
        },
        getAnchorPoints() {
          return [
            [0, 0.5],
            [1, 0.5],
          ];
        },
      },
      'rect',
    );
  };

  handleCollapse = (e: IG6GraphEvent): void => {
    if (this.graph) {
      const target = e.target;
      const id = target.get('modelId');
      const item = this.graph.findById(id);
      const nodeModel = item.getModel();

      nodeModel.collapsed = !nodeModel.collapsed;

      this.graph.layout();
      this.graph.setItemState(item, 'collapse', nodeModel.collapsed as boolean);
    }
  };

  graphRegisterEvents = (): void => {
    if (this.graph) {
      this.graph.on('collapse-text:click', (e) => {
        this.handleCollapse(e);
      });
      this.graph.on('collapse-back:click', (e) => {
        this.handleCollapse(e);
      });
    }
  };

  render(): JSX.Element {
    const { history } = this.props;

    return (
      <>
        <div style={{ display: 'flex', height: '64px', width: '100%', margin: '0 16px', alignItems: 'center' }}>
          <Button
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </Button>
        </div>
        <div ref={this.graphRef}></div>
      </>
    );
  }
}

export const ProcessMapPage = withRouter(ProcessMap);
