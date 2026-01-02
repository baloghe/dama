//import logo from './logo.svg';
import { Routes, Route } from 'react-router-dom';

import App from './App.js';
//import AdminPane from './AdminPane.js';

export default function AppRouter({tests, dbAvailable}) {
	return (
		<>
			<Routes>
				<Route path="/" element={<App 
											tests={tests}
											dbAvailable={dbAvailable}
										/>} 
									/>
			</Routes>
		</>
	);
};
