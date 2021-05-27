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
}): [{ [key: string]: any }, (e: any, checked: boolean) => void, () => void] {
  const [values, setValues] = useState(initValues)
  return [
    values,
    (e: any, checked: boolean) => {
      setValues({ ...values, [e.target.name]: checked })
    },
    () => setValues(initValues)
  ]
}
