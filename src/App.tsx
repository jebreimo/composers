import * as React from 'react';
import ComposerTable from "./ComposerTable.tsx";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import {SearchForm} from "./SearchForm.tsx";
import {createTheme, ThemeProvider, useMediaQuery} from "@mui/material";
import {getDefaultComposerDb, IComposer} from "./FindComposers.ts";

export default function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = createTheme({
        palette: {
            mode:  prefersDarkMode ? 'dark' : 'light',
        },
    });

    const [selectedComposers, setSelectedComposers] = React.useState<IComposer[]>([]);
    const [query, setQuery] = React.useState("");
    const [searchType, setSearchType] = React.useState("surname");
    const [allowPartialMatch, setAllowPartialMatch] = React.useState(false);

    const onApplyQuery = () => {
        console.log("Apply query");
    }

    React.useEffect(() => {
        getDefaultComposerDb().then((db) => setSelectedComposers(db.composers));
    });

    return <ThemeProvider theme={theme}>
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Typography
                variant="h3"
                sx={{marginBottom: 2}}
            >
                Composer Search
            </Typography>
            <SearchForm
                onQueryChanged={(value) => setQuery(value)}
                onSearchTypeChanged={(value) => setSearchType(value)}
                onApplyQuery={() => onApplyQuery()}
                onAllowPartialMatchChanged={(value) => setAllowPartialMatch(value)}
                sx={{marginBottom: 2}}
            />
            <ComposerTable
                composers={selectedComposers}
            />
        </Box>
    </ThemeProvider>;
}
