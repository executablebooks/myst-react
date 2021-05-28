import React, { useCallback, useState } from 'react'

import {
  AppBar,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SvgIcon,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core'
import { Restore } from '@material-ui/icons'

import throttle from 'lodash.throttle'

import MarkdownItRenderer, { TPresetName } from './renderer/renderBase'
import { useStyles, useForm } from './hooks'
import { defaultText } from './defaultText'

const options: {
  [key: string]: { default: boolean; tooltip?: string; alias?: string }
} = {
  html: {
    default: false,
    tooltip: 'enable HTML tags in source text'
  },
  // xhtmlOut: { default: false, tooltip: 'produce xhtml output' },
  // breaks: { default: false, tooltip: 'newlines in paragraphs are rendered as <br />' },
  linkify: { default: true, tooltip: 'auto-convert link text to links' },
  typographer: { default: true, tooltip: 'perform typographic replacements' },
  highlighting: { default: true, tooltip: 'syntax highlight fences' }
}

function App(): JSX.Element {
  const theme = useTheme()
  const classes = useStyles()

  // we maintain a throttled version of the source text here also, to parse to the renderer
  // to reduce the number of times that the preview gets rendered
  const [sourceText, setSourceText] = useState(defaultText)
  const [throttledSourceText, setThrottledSourceText] = useState(defaultText)
  const throttledSourceChange = useCallback(throttle(setThrottledSourceText, 300), [])
  const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceText(event.target.value)
    throttledSourceChange(event.target.value)
  }

  const [presetName, setPresetName] = useState<TPresetName>('default')

  const defaultOptions = Object.entries(options).reduce((p, [k, v]) => {
    p[k] = v.default
    return p
  }, {} as any)

  const [parseOptions, setParseOptions, resetParseOptions] = useForm(defaultOptions)

  function reset(): void {
    setSourceText(defaultText)
    setThrottledSourceText(defaultText)
    resetParseOptions()
    setPresetName('default')
  }

  return (
    <div className={classes.root}>
      <TopBar />
      <Paper style={{ padding: theme.spacing(2) }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" style={{ padding: theme.spacing(2) }}>
              <FormControl component="fieldset">
                <FormLabel>Parsing Options</FormLabel>
                <FormGroup aria-label="position" row>
                  {Object.entries(options).map(([key, value]) => (
                    <Tooltip key={key} title={value.tooltip || ''}>
                      <FormControlLabel
                        label={key}
                        control={
                          <Checkbox
                            color="primary"
                            name={key}
                            checked={parseOptions[key]}
                            onChange={setParseOptions}
                          />
                        }
                      />
                    </Tooltip>
                  ))}
                </FormGroup>
              </FormControl>
              <FormControl style={{ marginLeft: theme.spacing(1), minWidth: 120 }}>
                <InputLabel>Preset Name</InputLabel>
                <Select
                  labelId="preset-name-select-label"
                  id="preset-name-select-select"
                  value={presetName}
                  onChange={(
                    event: React.ChangeEvent<{
                      name?: string | undefined
                      value: unknown
                    }>
                  ) => setPresetName(event.target.value as TPresetName)}
                >
                  <MenuItem value="default">default</MenuItem>
                  <MenuItem value="commonmark">commonmark</MenuItem>
                  <MenuItem value="zero">zero</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  reset()
                }}
                startIcon={<Restore />}
                style={{ float: 'right' }}
              >
                Reset
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              // variant="outlined"
              style={{ padding: theme.spacing(2) }}
            >
              <TextField
                id="standard-textarea"
                label="Source Text"
                variant="outlined"
                placeholder="Write text here"
                multiline
                fullWidth
                value={sourceText}
                onChange={handleSourceChange}
                rowsMax={50}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              style={{
                padding: theme.spacing(2),
                height: '80vh',
                overflow: 'auto'
              }}
            >
              <MarkdownItRenderer
                source={throttledSourceText}
                presetName={presetName}
                options={parseOptions}
              />
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </div>
  )
}

function TopBar() {
  const classes = useStyles()

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          MyST Demonstrator
        </Typography>
        <IconButton color="inherit">
          <a
            href="https://github.com/executablebooks/myst-react"
            color="inherit"
            target="_blank"
          >
            <GitHubIcon />
          </a>
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export function GitHubIcon(): JSX.Element {
  return (
    <SvgIcon>
      <path
        // style=" stroke:none;fill-rule:evenodd;fill:rgb(10.588235%,12.156863%,13.72549%);fill-opacity:1;"
        d="M 12 0 C 5.371094 0 0 5.371094 0 12 C 0 17.308594 3.433594 21.796875 8.203125 23.386719 C 8.804688 23.488281 9.03125 23.128906 9.03125 22.816406 C 9.03125 22.53125 9.015625 21.585938 9.015625 20.578125 C 6 21.136719 5.21875 19.84375 4.980469 19.171875 C 4.84375 18.824219 4.261719 17.761719 3.75 17.476562 C 3.328125 17.25 2.730469 16.695312 3.734375 16.679688 C 4.679688 16.664062 5.355469 17.550781 5.578125 17.910156 C 6.660156 19.726562 8.386719 19.214844 9.074219 18.898438 C 9.179688 18.121094 9.496094 17.59375 9.839844 17.296875 C 7.171875 16.996094 4.378906 15.960938 4.378906 11.371094 C 4.378906 10.066406 4.84375 8.984375 5.609375 8.144531 C 5.488281 7.84375 5.070312 6.613281 5.730469 4.964844 C 5.730469 4.964844 6.734375 4.648438 9.03125 6.195312 C 9.988281 5.925781 11.011719 5.789062 12.03125 5.789062 C 13.050781 5.789062 14.070312 5.925781 15.03125 6.195312 C 17.324219 4.636719 18.328125 4.964844 18.328125 4.964844 C 18.988281 6.613281 18.570312 7.84375 18.449219 8.144531 C 19.214844 8.984375 19.679688 10.050781 19.679688 11.371094 C 19.679688 15.976562 16.875 16.996094 14.203125 17.296875 C 14.640625 17.671875 15.015625 18.390625 15.015625 19.515625 C 15.015625 21.121094 15 22.410156 15 22.816406 C 15 23.128906 15.226562 23.503906 15.824219 23.386719 C 20.566406 21.796875 24 17.296875 24 12 C 24 5.371094 18.628906 0 12 0 Z M 12 0 "
      />
    </SvgIcon>
  )
}

export default App
