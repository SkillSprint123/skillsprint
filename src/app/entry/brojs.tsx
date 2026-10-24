import React from 'react'
import {createRoot} from 'react-dom/client'

import type {BrojsComponent, BrojsContainer, BrojsRoot} from './types'

let root: BrojsRoot | undefined

export const mount = (
    Component: BrojsComponent,
    element: BrojsContainer = document.getElementById('app'),
) => {
    if (!element) throw new Error('SkillSprint: контейнер подключения не найден')
    root?.unmount()
    root = createRoot(element)
    root.render(<Component/>)

    if (module.hot) {
        module.hot.accept('../App', () => {
            root?.render(<Component/>)
        })
    }
}

export const unmount = () => {
    root?.unmount()
    root = undefined
}
