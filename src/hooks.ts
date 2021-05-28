import { useState } from 'react'

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    menuButton: {
      marginRight: theme.spacing(2)
    },
    title: {
      flexGrow: 1
    }
  })
)

export function useForm(initValues: {
  [key: string]: any
}): [{ [key: string]: any }, (name: string, value: any) => void, () => void] {
  const [values, setValues] = useState(initValues)
  return [
    values,
    (name: string, value: any) => {
      setValues({ ...values, [name]: value })
    },
    () => setValues(initValues)
  ]
}
