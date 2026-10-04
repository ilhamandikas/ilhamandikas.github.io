---
title: Currency Formatter Guide
description: Format a number as a currency amount with thousand separators and a symbol, in
  Indonesian or English style.
date: '2026-09-27'
tags:
- text
tool_guide_slug: currency-formatter
broader_guide:
  title: Calculators and Unit Conversion
  url: /guides/calculators-and-unit-conversion/
about: Turn a plain number into a readable money amount, or the other way round. Pick the
  symbol, the separator style and how many decimals to show, and the page writes the formatted
  value. It also reads a value you paste, so 1.250.000 and 1,250,000.50 both come back as
  numbers before being reformatted the way you want.
faq:
- q: Why do the separators matter?
  a: Indonesian uses a dot for thousands and a comma for decimals, the reverse of English.
    Sending 1.250 to a reader who expects English looks like one and a quarter, so the style
    switch keeps the amount unambiguous.
- q: What does the decimal places box do?
  a: It pins the number of digits after the decimal mark. Leave it blank and whole numbers
    show none while fractional ones show two; set it to 0 to round rupiah to the nearest whole
    unit.
- q: Does it add a currency code?
  a: No. It only knows the symbol you pick, so Rp and $ are distinguished by shape alone.
    Use a code such as IDR or USD when a machine has to read the value.
---

A currency formatter adds grouping separators and a chosen symbol to a number. [Currency Formatter](/tools/currency-formatter/) formats your **Amount** as you type; it does not exchange currencies or convert between IDR and USD.

## Format the same number two ways

Type `1250000` into **Amount**. With **Currency** at **Rupiah (Rp)** and **Separators** at **Indonesian**, **Formatted** should say `Rp1.250.000`. Switch to **English**: it becomes `Rp1,250,000`. The number itself did not change, and switching the separator style does not change the currency symbol. Enable **Space after the symbol** if you want `Rp 1,250,000` in this example.

The **Separators** setting also tells the tool how to *read* input. With Indonesian selected, `1.250,50` means one thousand two hundred fifty and a half; English expects `1,250.50` for that value. Change style before pasting a localized amount. Set **Decimal places** to `2` to force two digits after the decimal separator. If you see **That is not a number**, check which separator style you selected and remove any pasted currency letters before retrying.

This uses browser number formatting for display, not a financial calculation. Check the original amount, currency code, and rounding rules before sending a bill or using the text in software.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
