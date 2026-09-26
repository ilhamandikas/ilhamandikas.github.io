{{- $slug := .File.ContentBaseName -}}
{{- $tool := dict -}}
{{- range partial "tools/registry.html" . -}}
  {{- if eq .id $slug }}{{ $tool = . }}{{ end -}}
{{- end -}}
{{- $guide := partial "tools/guide.html" $slug -}}
# {{ $tool.name }}

{{ $tool.description }}

- Category: {{ $tool.category_name }} ({{ $tool.category }})
- URL: {{ $tool.url }}
- Documentation: {{ $tool.documentation }}
- Keywords: {{ delimit $tool.keywords ", " }}
{{ with $tool.use_cases }}
## Useful for

{{ range . }}- {{ . }}
{{ end }}{{ end }}
## Example questions

{{ range $tool.examples }}- {{ . }}
{{ end }}
## Properties

{{ range $tool.features }}- {{ . }}
{{ end }}
{{ with $guide.about }}
## About

{{ . }}
{{ end }}
{{ with $guide.faq }}
## Questions

{{ range . }}### {{ .q }}

{{ .a }}

{{ end }}{{ end -}}
