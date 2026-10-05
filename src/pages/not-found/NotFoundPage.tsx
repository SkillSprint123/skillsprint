import React from 'react'
import { Link } from 'react-router-dom'

import { appConfig } from '../../app/config/config'

export const NotFoundPage = () => (
  <section>
    <h1>Страница не найдена</h1>
    <Link to={appConfig.basePath}>Вернуться к обзору</Link>
  </section>
)
