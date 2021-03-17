import React, { FC } from 'react';
import { Layout } from 'antd';

export const HeaderComponent: FC = () => (
  <Layout.Header>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ color: '#fff', fontSize: '18px' }}>
        Process Map Demo
      </span>
    </div>
  </Layout.Header>
);
