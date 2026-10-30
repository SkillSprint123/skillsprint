import { appSectionsSchema } from './schemas'
import type { AppSections } from './types'

export const sections: AppSections = appSectionsSchema.parse([
  {
    path: 'plan',
    nanoId: 'learning-plan',
    title: 'План подготовки',
    navigationTitle: 'Мой план',
    caption: 'План подготовки',
    description: 'Цель, срок подготовки, темы и ежедневные задачи.',
  },
  {
    path: 'trainer',
    nanoId: 'trainer',
    title: 'Тренажёр вопросов',
    navigationTitle: 'Тренажёр',
    caption: 'Практика каждый день',
    description: 'Практика ответов и разбор ошибок по темам.',
  },
  {
    path: 'interview',
    nanoId: 'interview',
    title: 'AI-собеседование',
    navigationTitle: 'AI-интервью',
    caption: 'Репетиция собеседования',
    description: 'Вопросы GigaChat и обратная связь по ответам.',
  },
  {
    path: 'progress',
    nanoId: 'progress',
    title: 'Прогресс',
    caption: 'Твой прогресс',
    description: 'История занятий, слабые темы и рекомендации для повторения.',
  },
  {
    path: 'pro',
    title: 'Тарифы SkillSprint',
    caption: 'Тарифы',
    description: 'Бесплатный, Pro и Ultimate — выбери свой темп подготовки.',
  },
])
