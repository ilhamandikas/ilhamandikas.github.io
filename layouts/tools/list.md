{{- $tools := partial "tools/registry.html" . -}}
# {{ .Title }}

{{ .Description }}

{{ len $tools }} tools in {{ len site.Data.tools }} categories. Every tool runs in the browser; nothing is uploaded.

Machine-readable versions: [tools.json]({{ printf "%stools/tools.json" site.BaseURL }}) · [search-index.json]({{ printf "%stools/search-index.json" site.BaseURL }}) · [llms.txt]({{ printf "%sllms.txt" site.BaseURL }})

{{ range site.Data.tools -}}
## {{ .name }}

{{ range .tools -}}
- [{{ .name }}]({{ printf "%stools/%s/" site.BaseURL .slug }}) — {{ .desc }}
{{ end }}
{{ end -}}
