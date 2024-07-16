import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import {Button} from "@mui/material";
import {findComposer} from "./FindComposers.ts";

const NoResults = () => {
    return <Box
        sx={{bgcolor: '#cfe8fc', height: '100vh'}}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
    >
        <h1>No results found</h1>
    </Box>;
}

const Results = () => {
    return <Box
        sx={{bgcolor: '#cfe8fc', height: '100vh'}}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
    >
        <h1>Results found</h1>
    </Box>;
}

const ResultArea = ({results}: { results: string[] }) => {
    return results.length > 0 ? <Results/> : <NoResults/>;
}

function App() {
    // const [isDisabled, setIsDisabled] = React.useState(true);
    const [nextQuery, setNextQuery] = React.useState('');
    const [query, setQuery] = React.useState('');

    const handleEnterPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            console.log('Enter key pressed');
            setQuery(nextQuery);
            findComposer(query);
        }
    };

    return <>
        <Box
            sx={{bgcolor: '#cfe8fc', height: query.length > 0 ? '15vh' : '100vh'}}
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="10vh"
        >
            <TextField
                id="filled-search"
                label="Search field"
                type="search"
                variant="filled"
                onChange={(e) => setNextQuery(e.target.value)}
                onKeyDown={handleEnterPress}
            />
            <Button
                variant="outlined"
                disabled={nextQuery.length === 0}
                sx={{marginLeft: 2}}
                onClick={() => setQuery(nextQuery)}
            >
                Search
            </Button>
        </Box>
        {
            query.length > 0 ? <ResultArea results={[]}/> : null
        }
    </>;

        // return (
  //   <>
  //     <div>
  //       <a href="https://vitejs.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.tsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  // )
}

export default App
