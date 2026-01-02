import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import axios from "axios";


import Spinner from "./Spinner";

import './index.css';
import App from './App';
import AppRouter from "./AppRouter";


const demoData=[
  { "topic": "Chapter 1"
   ,"quiz":[
    { "question": "How are you?"
     ,"answers": ["Fine, thanks!", "So-so...", "Fuck off!"]
     ,"valid": [0,1]
     },
    { "question": "Did you enjoy the test?"
     ,"answers": ["Yes", "NO"]
     ,"valid": [1]
     }
   ]
  },
  { "topic": "Chapter 4"
   ,"quiz":[
    { "question": "What are the three essential components of Data Architecture?"
     ,"answers": ["Artifacts", "Activities", "Behavior", "Applications"]
     ,"valid": [0,1,2]
     },
    { "question": "Why is Data Architecture fundamental to data management?"
     ,"answers": ["It represents organizational data at different abstraction levels", "It eliminates the need for data models", "It helps management make decisions about data", "It replaces the need for data governance"]
     ,"valid": [0,2]
     },
    { "question": "What do Data Architecture artifacts typically include?"
     ,"answers": ["Standards for collecting and storing data", "Definitions and data flows", "Marketing strategies", "Specifications for existing and target states"]
     ,"valid": [0,1,3]
     }
   ]
  }
];


const reactRoot = ReactDOM.createRoot(document.getElementById('root'));
/*
root.render(
  <React.StrictMode>
    <App isDemo={true} demoData={demoData} />
  </React.StrictMode>
);
*/
reactRoot.render(
	<div>
		<p>Loading available titles...</p>
		<Spinner />
	</div>
);

axios
.post(`/api/qtopics`, null)
.then((data) => {
	console.log("DB connection OK.");
	reactRoot.render(
		<BrowserRouter>
			<AppRouter 
				tests={data.data.topics}
				dbAvailable={true}
			/>
		</BrowserRouter>
	);
	
})
.catch(error => {
	console.log("DB connection failed.");
	console.log(`${error}`);
	reactRoot.render(
		<BrowserRouter>
			<App 
				isDemo={true}
				demoData={demoData}
				dbAvailable={false}
			/>
		</BrowserRouter>
);
});



