import './App.css';
import React from 'react';


const useState = React.useState;

function formatDuration(d) {
	if(d===null) return '';
	let dsec = Math.floor(d/1000);
	let sec = dsec % 60;
	let dmin = Math.floor(dsec/60);
	let min = dmin % 60;
	let dh = Math.floor(dmin/60);
	
	if(dh > 23){
		return 'Loser!';
	} else {
		return `${dh > 0 ? '' + dh + ' h' : ''} ${min > 0 ? '' + min + ' m' : ''} ${sec > 0 ? '' + sec + ' s' : ''}`.trim();
	}
};

function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

const getTopics = (data) => data.map(e => e["topic"]);

const getTests = (data, topics, mode) => {
	let fltr = data.filter( (e,i) => topics.includes(i));
	let lst = [];
	for(topic of fltr){
		//console.log(`getTests :: topic=${topic["topic"]}`);
		lst = [...lst, ...topic["quiz"] ];
	}
	lst = shuffleArray(lst);
	if(mode==="ALL"){
		return lst;
	} else {
		return lst.filter((e,i) => (i<10));
	}
};

function Test({actNum, totNum, question, answers, valids, userAnswers, next, retry, submitAns, exit, showResults}){
	
	const [selAns, setSelAns] = useState([]);
	
	const handleNext = (ev) => {
		next();
	};
	
	const handleRetry = (ev) => {
		retry();
	};
	
	const handleSubmit = (ev) => {
		submitAns(selAns);
		setSelAns([]);
	};
	
	const handleExit = (ev) => {
		exit();
	};
	
	const renderButtons = (showResults) => {
		//True => OK / Retry
		if(showResults){
			return (
				<table><tbody><tr>
					<td><button onClick={handleNext}>Next</button></td>
					<td><button onClick={handleRetry}>Retry</button></td>
				</tr></tbody></table>
			);
		//False => Submit / Exit
		} else {
			return (
				<table><tbody><tr>
					<td><button onClick={handleSubmit}>Submit</button></td>
					<td><button onClick={handleExit}>Exit</button></td>
				</tr></tbody></table>
			);
		}
	};

	function multiSelect(value){
		return {
			"checked": showResults ? userAnswers.includes(value) : selAns.includes(value),
			"onChange": ev => {
				if(ev.target.checked) {
					newSelAns = [...selAns, value];
				} else {
					newSelAns = selAns.filter(v => v !== value);
				}
				setSelAns(newSelAns);
				//console.log(`TestContainer.selAns to ${newSelAns}`);
			}
		}
	}
	
	const renderRow = (showResults, i) => {
		//True => show valid selection with colored markers, user selection disabled
		if(showResults){
			let bad =    (valids.includes(i) && (!userAnswers.includes(i)))
			          || (userAnswers.includes(i) && (!valids.includes(i)))
					  ;
			let empty = (!valids.includes(i)) && (!userAnswers.includes(i));
			return (
				<tr key="{i}">
					<td key="res">
						{bad ? '\u274C' : (empty ? '' : '\u2705')}
					</td>
					<td key="ans">
						<input type="checkbox" disabled={true} {...multiSelect(i)}/>
					</td>
					<td key="txt">
						<p className={valids.includes(i) ? '' : 'nottochoose'}>{answers[i]}</p>
					</td>
				</tr>
			);
		//False => user selection enabled
		} else {
			return (
				<tr key="{i}">
					<td key="ans">
						<input type="checkbox" name={i} {...multiSelect(i)} />
					</td>
					<td key="txt">
						<p>{answers[i]}</p>
					</td>
				</tr>
			);
		}
	};
	
	return (
		<div>
			<div className="questionnumber">
				<span className="actNum">{actNum+1}</span> / <span className="totNum">{totNum}</span>
			</div>
			<p className="question">{question}</p>
			<table><tbody>
				{answers.map((e,i) => renderRow(showResults, i))}
			</tbody></table>
			{renderButtons(showResults)}
		</div>
	);
}

function TestContainer({tests, exit, finish}){
	
	//const getShuffle = (num) => shuffleArray(Array.from(Array( num ).keys()));
	const getShuffle = (num) => {
		let a = shuffleArray(Array.from(Array( num ).keys()));
		//console.log(`TestContainer :: new shuffle: ${a}`);
		return a;
	};
	
	const [state, setState] = useState("QUESTION");
	const [actTestNum, setActTestNum] = useState(0);
	const [actShuffle, setActShuffle] = useState( getShuffle(tests[0]["answers"].length) );
	const [actUserAns, setActUserAns] = useState([]);
	const [goodAns, setGoodAns] = useState(0);
	const [badAns, setBadAns] = useState(0);
	
	const mapAnswersToShuffle = () => actShuffle.map( (e) => tests[actTestNum]["answers"][e] );
	//const mapValidsToShuffle = () => tests[actTestNum]["valid"].map( (e) => actShuffle.indexOf(e) );
	const mapValidsToShuffle = () => {
		let vorig = tests[actTestNum]["valid"];
		v = vorig.map( (e) => actShuffle.indexOf(e) );
		//console.log(`TestContainer :: valid: ${vorig}, shuffle: ${actShuffle} => mapValid=${v}`);
		return v;
	};
	const isGoodAns = (actAns) => {
		let v = mapValidsToShuffle();
		if(actAns.length !== v.length) return false;
		v.sort();
		let a = actAns.map(e=>e).sort();
		let ret = true;
		for(i in a){
			if(a[i] !== v[i]){
				ret = false;
				break;
			}
		}
		return ret;
	};
	
	const next = () => {
		//increase counter
		newTestNum = actTestNum + 1;
		setActTestNum(newTestNum);
		if(newTestNum >= tests.length){
			//end of questions, return to Settings to show results
			finish(goodAns, badAns);
		} else {
			//Shuffle answers
			setActShuffle( getShuffle( tests[newTestNum]["answers"].length ) );
			//show next question
			setState("QUESTION");
		}
	};
	
	const submitAns = (selAns) => {
		setActUserAns(selAns);
		if(isGoodAns(selAns)){
			setGoodAns(goodAns+1);
			//console.log(`Good answer! good=${goodAns+1}, bad=${badAns}`);
		} else {
			setBadAns(badAns+1);
			//console.log(`Bad answer... good=${goodAns}, bad=${badAns+1}`);
		}
		
		setState("RESULTS");
	};
	
	const retry = () => {
		//reshuffle and ask again, without increasing the counter
		setActShuffle( getShuffle( tests[actTestNum]["answers"].length ) );
		setState("QUESTION");
	};
	
	const exitTest = () => {
		exit();
	};
	
  if(state==="QUESTION"){
    return (<Test actNum={actTestNum} totNum={tests.length} question={tests[actTestNum]["question"]} answers={mapAnswersToShuffle()} next={next} retry={retry} submitAns={submitAns} exit={exitTest} showResults={false} />);
  } else {
    return (<Test actNum={actTestNum} totNum={tests.length} question={tests[actTestNum]["question"]} answers={mapAnswersToShuffle()} valids={mapValidsToShuffle()} userAnswers={actUserAns} next={next} retry={retry} showResults={true} />);
  }
}

function Settings({topics, changeSelTopics, modes, changeMode, start}){
	
	const [selTopics, setSelTopics] = useState([]);
	const [mode, setMode] = useState(modes[0]);

	function multiSelect(value){
		return {
			"checked": selTopics.includes(value),
			"onChange": ev => {
				if(ev.target.checked) {
					newTopics = [...selTopics, value];
				} else {
					newTopics = selTopics.filter(v => v !== value);
				}
				setSelTopics(newTopics);
				changeSelTopics(newTopics);
				//console.log(`Settings.selTopics to ${newTopics}`);
			}
		}
	}
	
	function modeChanged(ev){
		newValue = ev.target.value;
		setMode(newValue);
		changeMode(newValue);
		//console.log(`Settings.mode to ${newValue}`);
	}
	
	return (
    <div>
	<h3>Topics</h3>
	<ul>
		{topics.map( (e,i) => (
			<li key={i} className="checkbox">
				<label>
					<input type="checkbox" name={e} {...multiSelect(i)}/>
					{e}
				</label>
			</li>
		))}
	</ul>
  
	<h3>Mode</h3>
  
	<select name="select" onChange={modeChanged}>
	  {modes.map( e => <option value={e} selected={mode === e}>{e}</option>	  )}
	</select>
	
	<h3>Let's go!</h3>
	
	<button className="startBtn" onClick={start}><span>Start</span></button>
  
  </div>
	);
}

function Results({results, quit}){
	
	const buildRow = (r, i) => (
    <tr key={i}>
      <td key={'g'+i}> {r['good']} </td>
      <td key={'b'+i}> {r['bad']} </td>
      <td key={'d'+i}> {r['duration']} </td>
    </tr>
	);
	
	return (
		<div>
			<h3>Results</h3>
			<table><thead>
				<tr>
					<th key='gh'>Good</th>
					<th key='bh'>Bad</th>
					<th key='dh'>Duration</th>
				</tr>
			</thead><tbody>
				{results.map((e,i) => buildRow(e,i))}
			</tbody></table>
			<button onClick={quit}>Fine</button>
		</div>
	);
	
}

function App({isDemo, demoData}){
	
	const modes = ["ALL", "MAX10"];
	
	const [data, setData] = useState(isDemo ? demoData : []);

	const [state, setState] = useState("SETTINGS");
	const [topics, setTopics] = useState(isDemo ? getTopics(demoData) : []);
	const [selTopics, setSelTopics] = useState([]);
	const [mode, setMode] = useState(modes[0]);
	const [startTime, setStartTime] = useState();
	const [results, setResults] = useState([]);

	const changeSelTopics = (newTopics) => {
		setSelTopics(newTopics);
		//console.log(`App.selTopics to ${newTopics}`);
	};
	
	const changeMode = (newMode) => {
		setMode(newMode);
		//console.log(`App.mode to ${newMode}`);
	};
	
	const startTest = () => {
		setState("TEST");
		setStartTime(new Date());
		//console.log(`App :: startTest with topics=${selTopics}, mode=${mode}`);
	};
	
	const finishTest = (good, bad) => {
		let duration = formatDuration(new Date() - startTime);
		let res = {'good': good, 'bad': bad, 'duration': duration};
		//console.log(`App.finishTest :: good=${res['good']}, bad=${res['bad']}, dur=${res['duration']}`);
		setResults([...results, res]);
		setState("RESULTS");
	};
	
	const exitTest = () => {
		setState("SETTINGS");
	};
	
	const quitResults = () => {
		setState("SETTINGS");
	};

  return (
    <div>
		<h2>DAMA {isDemo ? "-DEMO" : ""}</h2>
		{state==="SETTINGS" ? <Settings topics={topics} changeSelTopics={changeSelTopics} modes={modes} changeMode={changeMode} start={startTest} /> : null }
		{state==="TEST" ? <TestContainer tests={getTests(data, selTopics, mode)} exit={exitTest} finish={finishTest} /> : null }
		{state==="RESULTS" ? <Results results={results} quit={quitResults} /> : null }
    </div>
  );

}

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
]

//ReactDOM.render(<App isDemo={true} demoData={demoData} />, document.querySelector("#app"))

export default App;
