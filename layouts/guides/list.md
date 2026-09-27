{{- $guides := .RegularPages -}}
# {{ .Title }}

{{ .Description }}

{{ len $guides }} guides.

{{ range $guides -}}
## [{{ .Title }}]({{ .Permalink }})

- Markdown: {{ printf "%sindex.md" .Permalink }}
{{- with .Params.tags }}
- Tags: {{ delimit . ", " }}
{{- end }}
- Description: {{ .Description }}

{{ end -}}
