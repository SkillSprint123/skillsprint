# Inter

Inter Variable разделён на три WOFF2-файла: `latin`, `cyrillic` и `other`.
Все символы исходного шрифта сохранены; оси `wght` (100–900) и `opsz` (14–32)
сохранены в каждой части. Лицензия — `Inter-LICENSE.txt` и метаданные шрифтов.

Диапазоны `unicode-range` находятся в `../fonts.ts`. Они не пересекаются.
Браузер загружает только части, необходимые для символов на странице.
Регистрация `@font-face` проходит через Goober в контейнере приложения.

Для повторной генерации из полного Inter Variable используйте FontTools 4.60.2
с Brotli 1.2.1. Для каждой части передайте её диапазон из `fonts.ts`:

```sh
pyftsubset /path/to/InterVariable.woff2 --output-file=InterVariable-latin.woff2 --flavor=woff2 --unicodes='<диапазон части>' --name-IDs='*' --name-legacy --name-languages='*'
```

После генерации проверьте, что объединение Unicode cmap трёх частей совпадает
с cmap оригинала, а значения осей `fvar` не изменились.
