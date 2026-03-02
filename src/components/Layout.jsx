// src/components/Layout.jsx
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <div className="main-container">
        <Sidebar />
        <div className="content-area">
          <Outlet />  {/* Yahan Pos, Dashboard etc load honge */}
        </div>
      </div>
    </div>
  );
}