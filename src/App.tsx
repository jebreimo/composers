import * as React from 'react';
import EnhancedTable from "./ComposerTable.tsx";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import {SearchForm} from "./SearchForm.tsx";
import {createTheme, ThemeProvider, useMediaQuery} from "@mui/material";

export default function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const darkTheme = createTheme({
        palette: {
            mode:  prefersDarkMode ? 'dark' : 'light',
        },
    });

    return <ThemeProvider theme={darkTheme}>
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
                searchType="surname"
                onQueryChanged={(query) => console.log(query)}
                onSearchTypeChanged={(searchType) => console.log(searchType)}
                onApplyQuery={() => console.log("Apply query")}
                onAllowPartialMatchChanged={(allowPartialMatch) => console.log(allowPartialMatch)}
                sx={{marginBottom: 2}}
            />
            <EnhancedTable/>
        </Box>
    </ThemeProvider>;
}
