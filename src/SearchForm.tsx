import * as React from 'react';
import TextField from "@mui/material/TextField";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {Button, Stack} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Box from '@mui/material/Box';
import {QuestionMark, QuestionMarkOutlined} from "@mui/icons-material";

export type SearchType = "surname" | "given";

export interface SearchFormProps {
    searchType?: SearchType;
    allowPartialMatch?: boolean;
    query?: string;
    onSearchTypeChanged: (searchType: SearchType) => void;
    onQueryChanged: (query: string) => void;
    onApplyQuery: () => void;
    onAllowPartialMatchChanged: (allowPartialMatch: boolean) => void;
    sx: undefined | object;
}

function SearchSettings(props: {
    searchType: "surname" | "given",
    onSearchTypeChange: (_ev: React.MouseEvent<HTMLElement>, newAlignment: string) => void,
    partialMatch: boolean,
    onPartialMatchChange: (_ev: React.ChangeEvent<HTMLInputElement>) => void
}) {
    return <Stack
        direction="row"
        spacing={2}
        sx={{marginBottom: 2}}
    >
        <ToggleButtonGroup
            color="primary"
            value={props.searchType}
            exclusive
            onChange={props.onSearchTypeChange}
            aria-label="Platform"
        >
            <ToggleButton value="given">For- og mellomnavn</ToggleButton>
            <ToggleButton value="surname">Etternavn</ToggleButton>
        </ToggleButtonGroup>
        <FormControlLabel
            control={<Checkbox
                checked={props.partialMatch}
                onChange={props.onPartialMatchChange}
            />}
            label="Delvise treff"/>
    </Stack>;
}

function HelpText() {
    const rawHtml = "<p>Søkeordet er et regulært uttrykk, det betyr at i tillegg til bokstaver kan man benytte \"jokertegn\" som representerer ukjente tegn. </p>\n" +
        "<p>De nyttigste jokertegnene er:</p>\n" +
        "<ul>\n" +
        "<li><code>.</code> som representer et enkelt tegn. Eksempel: <code>...a.</code> vil gi alle navn på fem bokstaver der fjerde bokstav er en \"a\".</li>\n" +
        "<li><code>.*</code> for er en sekvens av 0 eller flere tegn. Eksempel <code>G.*g</code> kan resultere i \"Grieg\" og \"Gaathaug\".</li>\n" +
        "<li><code>.{lengde}</code> for en sekvens av tegn med gitt lengde (lengde er et tall). Eksempel: <code>.{10}i...</code> resulterer i \"Sjostakovitsj\".</li>\n" +
        "</ul>\n" +
        "<p><a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet' target='_blank' rel='noopener noreferrer'>Mer informasjon om regulære uttrykk.</a></p>";
    return <Box>
        <div dangerouslySetInnerHTML={{__html: rawHtml}} />
    </Box>;
}
export function SearchForm(props: SearchFormProps ) {
    const [searchType, setSearchType] = React.useState(props.searchType || "surname");
    const [showSettings, setShowSettings] = React.useState(false);
    const [showHelp, setShowHelp] = React.useState(false);
    const [allowPartialMatch, setAllowPartialMatch] = React.useState(props.allowPartialMatch || false);
    const onSearchTypeChanged = (
        _ev: React.MouseEvent<HTMLElement>,
        newAlignment: string,
    ) => {
        setSearchType(newAlignment as SearchType);
        props.onSearchTypeChanged(newAlignment as SearchType);
    };

    return <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={props.sx}
    >
        <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
        >
            <TextField
                id="filled-search"
                label={searchType === "surname" ? "Etternavn" : "Fornavn"}
                type="search"
                variant="standard"
                sx={{marginBottom: "25px", marginRight: "10px", marginLeft: "10px"}}
                onChange={(ev) => props.onQueryChanged(ev.target.value)}
                onKeyDown={(ev) => {if (ev.key === 'Enter') props.onApplyQuery();}}
            />
            <Box marginLeft={2} marginRight={4}>
                <Button variant="contained" onClick={props.onApplyQuery}>
                    Søk
                </Button>
            </Box>
            <Checkbox
                icon={<SettingsOutlinedIcon/>}
                checkedIcon={<SettingsIcon/>}
                onChange={() => setShowSettings(!showSettings)}
            />
            <Checkbox
                icon={<QuestionMarkOutlined/>}
                checkedIcon={<QuestionMark/>}
                onChange={() => setShowHelp(!showHelp)}
            />
        </Box>
        {showSettings &&
            <SearchSettings
                searchType={searchType}
                onSearchTypeChange={onSearchTypeChanged}
                partialMatch={allowPartialMatch}
                onPartialMatchChange={(ev) => {
                    setAllowPartialMatch(ev.target.checked);
                    props.onAllowPartialMatchChanged(ev.target.checked);
                }}
            />
        }
        {showHelp && <HelpText/>}
    </Box>
}
