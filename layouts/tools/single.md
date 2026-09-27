{{- $slug := .File.ContentBaseName -}}
{{- $tool := dict -}}
{{- range partial "tools/registry.html" . -}}
  {{- if eq .id $slug }}{{ $tool = . }}{{ end -}}
{{- end -}}
{{- $guide := partial "tools/guide.html" $slug -}}
# {{ $tool.name }}

{{ $tool.description }}

## URL

{{ $tool.canonical_url }}

## What It Does

{{ with $guide.about }}{{ . }}{{ else }}{{ $tool.description }}{{ end }}

## Features

{{ range $tool.features }}- {{ . }}
{{ end }}
## Input

{{ with $tool.input.format }}{{ . }} {{ end }}{{ $tool.input.type | default "text" }} input.

## Output

{{ with $tool.output.format }}{{ . }} {{ end }}{{ $tool.output.type | default "text" }} output.

## Privacy

{{ if eq $tool.privacy.processing "client-side" -}}
Processing happens locally in the browser.

No input data is uploaded to ilham.dev.
{{- else if eq $tool.privacy.processing "third-party-api" -}}
This tool sends the necessary request data to a third-party API or to the endpoint you provide so it can complete the lookup or test.
{{ with $tool.privacy.provider }}
Provider: {{ . }}.
{{ end -}}
{{- else -}}
Processing: {{ $tool.privacy.processing }}.
{{- end }}

- Requires login: {{ $tool.requires_login }}
- Requires API key: {{ $tool.requires_api_key }}
- Stores user data: {{ $tool.stores_user_data }}

{{ with $tool.use_cases }}
## Use Cases

{{ range . }}- {{ . }}
{{ end }}{{ end }}
## Examples

{{ range $tool.examples }}- {{ . }}
{{ end }}
{{ with $tool.limitations }}
## Limitations

{{ range . }}- {{ . }}
{{ end }}{{ end }}
{{ with $tool.related_tools }}
## Related Tools

{{ range . }}- {{ printf "%stools/%s/" site.BaseURL . }}
{{ end }}{{ end }}
{{ with $guide.faq }}
## Questions

{{ range . }}### {{ .q }}

{{ .a }}

{{ end }}{{ end -}}
