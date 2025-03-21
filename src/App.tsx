import * as React from 'react';
import ComposerTable from "./ComposerTable.tsx";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import {SearchForm} from "./SearchForm.tsx";
import {createTheme, ThemeProvider, useMediaQuery} from "@mui/material";
import {getDefaultComposerDb, IComposer, IQuery, QueryType} from "./FindComposers.ts";
import {nbNO} from '@mui/material/locale';

interface IAction {
    type: string;
    payload: string | boolean;
}

const queryReducer = (state: IQuery, action: IAction): IQuery => {
    if (action.type === "EXPRESSION") {
        return {...state, expression: action.payload as string};
    } else if (action.type === "PARTIAL_MATCH") {
        return {...state, partialMatch: action.payload as boolean};
    } else if (action.type === "QUERY_TYPE") {
        return {...state, queryType: action.payload as QueryType};
    } else {
        return state;
    }
}

function Subtitle() {
    const rawHtml = "<p>for løsing av kryssord og <a href='https://radio.nrk.no/serie/rebus-radio' target='_blank' rel='noopener noreferrer'>NRK Klassisk's rebus</a>.</p>";
    return <div dangerouslySetInnerHTML={{__html: rawHtml}}/>;
}

function Title() {
    return <Typography variant="h3">
        Komponistsøk
    </Typography>;
}

export default function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = createTheme({
            palette: {
                mode:  prefersDarkMode ? 'dark' : 'light',
            }
        },
        nbNO);

    const [query, dispatchQuery] = React.useReducer(queryReducer,
        {expression: ".*", partialMatch: false, queryType: "surname"});

    const handleSetExpression = (expression: string) => {
        dispatchQuery({type: "EXPRESSION", payload: expression});
        console.log("Set expression: " + expression);
    }

    const handleSetPartialMatch = (partialMatch: boolean) => {
        dispatchQuery({type: "PARTIAL_MATCH", payload: partialMatch});
    }

    const handleSetQueryType = (queryType: string) => {
        dispatchQuery({type: "QUERY_TYPE", payload: queryType});
    }

    const [selectedComposers, setSelectedComposers] = React.useState<IComposer[]>([]);

    const [isFirstQuery, setIsFirstQuery] = React.useState(true);

    const onApplyQuery = () => {
        if (query !== undefined)
        {
            getDefaultComposerDb()
                .then((db) => db.find(query))
                .then((composers) => {
                    console.log("Found " + composers.length + " composers");
                    setSelectedComposers(composers);
                    setIsFirstQuery(false);
                });
        }
        console.log("Apply query");
    }

    return <ThemeProvider theme={theme}>
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight={isFirstQuery && "100vh" || "auto"}
        >
            <Title />
            <Subtitle />
            <SearchForm
                onQueryChanged={(value) => handleSetExpression(value)}
                onSearchTypeChanged={(value) => handleSetQueryType(value)}
                onApplyQuery={() => onApplyQuery()}
                onAllowPartialMatchChanged={(value) => handleSetPartialMatch(value)}
                sx={{marginBottom: 2, marginTop: 2}}
            />
            {!isFirstQuery &&
                <ComposerTable
                    composers={selectedComposers}
                />
            }
        </Box>
    </ThemeProvider>;
}
