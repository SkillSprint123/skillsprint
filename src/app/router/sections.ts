import { appSectionsSchema } from './schemas'
import type { AppSections } from './types'

export const sections: AppSections = appSectionsSchema.parse([
  {
    path: 'plan',
    nanoId: 'learning-plan',
    title: 'План подготовки',
    description: 'Цель, срок подготовки, темы и ежедневные задачи.',
  },
  {
    path: 'trainer',
    nanoId: 'trainer',
    title: 'Тренажёр вопросов',
    description: 'Практика ответов и разбор ошибок по темам.',
  },
  {
    path: 'interview',
    nanoId: 'interview',
    title: 'AI-собеседование',
    description: 'Вопросы GigaChat и обратная связь по ответам.',
  },
  {
    path: 'progress',
    nanoId: 'progress',
    title: 'Прогресс',
    description: 'История занятий, слабые темы и рекомендации для повторения.',
  },
  {
    path: 'pro',
    title: 'Тариф Pro',
    description:
      'Сценарий бесплатного тарифа с лимитом AI-сессий и перехода на Pro.',
  },
])
