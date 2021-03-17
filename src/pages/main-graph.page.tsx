import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import G6, { Graph } from '@antv/g6';
import { Button, Modal } from 'antd';
import { withRouter } from 'react-router-dom';

type INode = {
  id: string;
  label: string;
  cluster?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class MainGraph extends PureComponent<any, any> {
  private graph: Graph | undefined = undefined;
  private graphRef = React.createRef<HTMLDivElement>();

  state = {
    detailVisible: false,
    detailSelected: {
      id: null,
      label: null,
      cluster: null,
    },
    nodes: [
      {
        id: 'servera',
        label: 'server-a.example.com',
        cluster: 'default',
      },
      {
        id: 'serverb',
        label: 'server-b.example.com',
        cluster: 'default',
      },
      {
        id: 'serverc',
        label: 'server-c.example.com',
        cluster: 'default',
      },
    ],
    edges: [
      {
        source: 'servera',
        target: 'serverb',
      },
      {
        source: 'servera',
        target: 'serverc',
      },
    ],
  };

  componentDidMount(): void {
    this.graphInitialize();
    this.graphRegisterEvents();
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  componentDidUpdate(prevProps: any, prevState: any): void {
    if (prevState.nodes !== this.state.nodes && prevState.edges !== this.state.edges && this.graph) {
      this.graph.changeData({
        nodes: this.state.nodes.slice(),
        edges: this.state.edges.slice(),
      });
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  /* eslint-enable @typescript-eslint/explicit-module-boundary-types */

  graphInitialize = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // eslint-disable-next-line react/no-find-dom-node
    const container = ReactDOM.findDOMNode(this.graphRef.current) as HTMLElement;
    const width = window.innerWidth;
    const height = window.innerHeight - 64;

    const contextMenu = new G6.Menu({
      getContent(): string {
        return `
          <ul class="ant-menu ant-menu-sub ant-menu-vertical">
            <li class="ant-menu-item ant-menu-item-only-child" data-key="detail">View Detail</li>
            <li class="ant-menu-item ant-menu-item-only-child" data-key="processmap">View Process Map</li>
          </ul>
        `;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleMenuClick(target: HTMLElement, item: any): void {
        const key = target.getAttribute('data-key');
        const { model } = item._cfg;
        const node: INode = {
          id: model.id,
          label: model.label,
          cluster: model.cluster,
        };

        /* eslint-disable indent */
        switch (key) {
          case 'detail':
            self.showDetail(node);
            break;
          case 'processmap':
            self.goToProcessMap();
            break;
          default:
            break;
        }
        /* eslint-enable indent */
      },
      offsetX: 16,
      offsetY: 10,
      itemTypes: ['node'],
    });

    this.graph = new G6.Graph({
      container,
      width,
      height,
      modes: {
        default: ['drag-canvas', 'drag-node'],
      },
      layout: {
        type: 'fruchterman',
        gravity: 5,
        speed: 5,
      },
      animate: true,
      defaultNode: {
        type: 'node',
        size: 128,
        labelCfg: {
          style: {
            fill: '#000000A6',
            fontSize: 12,
          },
        },
        style: {
          stroke: '#72CC4A',
          width: 150,
        },
      },
      plugins: [contextMenu],
    });

    this.graph.data({
      nodes: this.state.nodes.slice(),
      edges: this.state.edges.slice(),
    });

    this.graph.render();
  };

  graphRegisterEvents = (): void => {
    // console.log('registering graph events');

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react/no-find-dom-node
      const container = ReactDOM.findDOMNode(this.graphRef.current) as HTMLElement;

      window.onresize = () => {
        if (this.graph && container) {
          this.graph.changeSize(container.scrollWidth, container.scrollHeight);
        }
      };
    }
  };

  showDetail = (node: INode): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.setState((prevState: any) => ({
      ...prevState,
      detailVisible: true,
      detailSelected: {
        id: node.id,
        label: node.label,
        cluster: node.cluster,
      },
    }));
  };

  hideDetail = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.setState((prevState: any) => ({
      ...prevState,
      detailVisible: false,
      detailSelected: {
        id: null,
        label: null,
        cluster: null,
      },
    }));
  };

  goToProcessMap = (): void => {
    const { history } = this.props;

    history.push('/processmap');
  };

  render(): JSX.Element {
    const { detailVisible, detailSelected } = this.state;

    return (
      <>
        <div ref={this.graphRef}></div>
        <Modal
          title="Node Detail"
          visible={detailVisible}
          footer={<Button onClick={this.hideDetail}>Close</Button>}
          destroyOnClose
          closable={false}
        >
          <span>ID: {detailSelected.id}</span>
          <br />
          <span>Label: {detailSelected.label}</span>
        </Modal>
      </>
    );
  }
}

export const MainGraphPage = withRouter(MainGraph);
