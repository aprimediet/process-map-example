import React, { FC } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MainGraphPage } from './pages/main-graph.page';
import './App.css';
import { HeaderComponent } from './components/header.component';
import { ProcessMapPage } from './pages/process-map.page';

export const App: FC = () => {
  return (
    <div className="App">
      <HeaderComponent />
      <BrowserRouter>
        <Switch>
          <Route path="/" exact>
            <MainGraphPage />
          </Route>
          <Route path="/processmap" exact>
            <ProcessMapPage />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
};
