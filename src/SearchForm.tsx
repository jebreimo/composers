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

export function SearchForm(props: SearchFormProps ) {
    const [searchType, setSearchType] = React.useState(props.searchType || "surname");
    const [showSettings, setShowSettings] = React.useState(false);
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
                label={searchType === "surname" ? "Surname" : "Given name"}
                type="search"
                variant="standard"
                sx={{marginBottom: "25px", marginRight: "10px", marginLeft: "10px"}}
                onChange={(ev) => props.onQueryChanged(ev.target.value)}
                onKeyDown={(ev) => {if (ev.key === 'Enter') props.onApplyQuery();}}
            />
            <Box
                marginLeft={2}
                marginRight={4}
            >
                <Button
                    variant="contained"
                    onClick={props.onApplyQuery}
                >
                    Search
                </Button>
            </Box>
            <Checkbox
                icon={<SettingsOutlinedIcon/>}
                checkedIcon={<SettingsIcon/>}
                onChange={() => setShowSettings(!showSettings)}
            />
        </Box>
        {showSettings &&
            <Stack
                direction="row"
                spacing={2}
                sx={{marginBottom: 2}}
            >
                <ToggleButtonGroup
                    color="primary"
                    value={searchType}
                    exclusive
                    onChange={onSearchTypeChanged}
                    aria-label="Platform"
                >
                    <ToggleButton value="given">Given Name</ToggleButton>
                    <ToggleButton value="surname">Surname</ToggleButton>
                </ToggleButtonGroup>
                <FormControlLabel
                    control={<Checkbox
                        checked={allowPartialMatch}
                        onChange={(ev) => {
                            setAllowPartialMatch(ev.target.checked);
                            props.onAllowPartialMatchChanged(ev.target.checked);
                        }}
                    />}
                    label="Allow partial match"/>
            </Stack>
        }
    </Box>
}
