import { plansSchema } from './schemas'
import type { PlanId } from './types'

// Illustrative product offers. No payment or server entitlements are connected.
export const plans = plansSchema.parse([
  {
    id: 'free',
    name: 'Бесплатный',
    price: 0,
    label: 'ДЛЯ ПЕРВОГО ШАГА',
    description: 'Познакомься с платформой и найди свой ритм подготовки.',
    features: [
      'Личный план подготовки',
      'Базовый тренажёр вопросов',
      'Знакомство с AI-интервью',
      'История твоего прогресса',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 790,
    label: 'ДЛЯ УВЕРЕННОГО РОСТА',
    description: 'Больше практики и обратной связи на пути к новой роли.',
    featured: true,
    features: [
      'Всё из бесплатного тарифа',
      'Больше сессий с AI-интервьюером',
      'Подробный разбор ответов',
      'Персональные рекомендации',
      'Расширенная аналитика прогресса',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 9990,
    label: 'ДЛЯ БОЛЬШИХ АМБИЦИЙ',
    description: 'Максимум поддержки для тех, кто целится особенно высоко.',
    features: [
      'Всё из Pro',
      'Индивидуальная стратегия роста',
      'Приоритетная обратная связь',
      'Персональное сопровождение',
      'Подготовка к сложным интервью',
    ],
  },
])
export const getPlan = (id: PlanId) =>
  plans.find((plan) => plan.id === id) || plans[0]
export const formatPrice = (price: number) =>
  `${new Intl.NumberFormat('ru-RU').format(price)} ₽`
