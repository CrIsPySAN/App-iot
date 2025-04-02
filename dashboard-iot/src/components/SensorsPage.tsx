import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import SensorView from './SensorView';

const SensorsPage: React.FC = () => {
    return (
        <div className="app-container">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="content-wrapper">
                    <SensorView />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SensorsPage;
