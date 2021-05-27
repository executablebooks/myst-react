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
  Paper,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core'
import { Restore } from '@material-ui/icons'

import MarkdownItRenderer from './renderer/renderBase'

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

  const defaultOptions = Object.entries(options).reduce((p, [k, v]) => {
    p[k] = v.default
    return p
  }, {} as any)

  const [parseOptions, setParseOptions, resetParseOptions] = useForm(defaultOptions)

  function reset(): void {
    setSourceText(defaultText)
    resetParseOptions()
  }

  return (
    <div className={classes.root}>
      <TopBar />
      <Paper style={{ padding: theme.spacing(2) }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" style={{ padding: theme.spacing(2) }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Parsing Options</FormLabel>
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
              <MarkdownItRenderer source={sourceText} options={parseOptions} />
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
