// Внешние API React/DOM имеют штатные типы; бизнес-данные выводятся из Zod.
import type { ComponentType } from 'react'
import type { Root } from 'react-dom/client'

export type BrojsComponent = ComponentType
export type BrojsContainer = HTMLElement | null
export type BrojsRoot = Root
