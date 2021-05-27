import React, { useState } from 'react'

import {
  AppBar,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core'
import { Restore } from '@material-ui/icons'

import MarkdownItRenderer, { TPresetName } from './renderer/renderBase'

import { useStyles, useForm } from './hooks'
import { defaultText } from './defaultText'

const options: { [key: string]: { default: boolean; tooltip?: string } } = {
  html: {
    default: false,
    tooltip: 'enable HTML tags in source text'
  },
  // xhtmlOut: { default: false, tooltip: 'produce xhtml output' },
  // breaks: { default: false, tooltip: 'newlines in paragraphs are rendered as <br />' },
  linkify: { default: true, tooltip: 'auto-convert link text to links' },
  typographer: { default: true, tooltip: 'do typographic replacements' }
}

function App(): JSX.Element {
  const theme = useTheme()
  const classes = useStyles()

  const [sourceText, setSourceText] = useState(defaultText)

  const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceText(event.target.value)
  }

  const [presetName, setPresetName] = useState<TPresetName>('default')

  const defaultOptions = Object.entries(options).reduce((p, [k, v]) => {
    p[k] = v.default
    return p
  }, {} as any)

  const [parseOptions, setParseOptions, resetParseOptions] = useForm(defaultOptions)

  function reset(): void {
    setSourceText(defaultText)
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
                source={sourceText}
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
      </Toolbar>
    </AppBar>
  )
}

export default App
