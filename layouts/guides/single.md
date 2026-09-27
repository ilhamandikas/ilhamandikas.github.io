{{- if .Params.tool_guides_index -}}
# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
- URL: {{ .Permalink }}
- Topic guides: {{ "guides/" | absURL }}

{{- $pages := site.RegularPages -}}
{{- range site.Data.tools }}

## {{ .name }}

{{- range .tools }}
{{- $slug := .slug -}}
{{- with where $pages "Params.tool_guide_slug" $slug }}
{{- range . }}
- [{{ .Title }}]({{ .Permalink }}) — {{ .Description }}
{{- end }}
{{- end }}
{{- end }}
{{- end -}}
{{- else if .Params.topic_guides_index -}}
# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
- URL: {{ .Permalink }}
- Tool notes: {{ "guides/tools/" | absURL }}

{{- $topicGuides := slice -}}
{{- range site.RegularPages -}}
  {{- if and (eq .Section "guides") (not .Params.tool_guide_slug) (not .Params.tool_guides_index) (not .Params.topic_guides_index) -}}
    {{- $topicGuides = $topicGuides | append . -}}
  {{- end -}}
{{- end }}
{{- range sort $topicGuides "Title" }}
- [{{ .Title }}]({{ .Permalink }}) — {{ .Description }}
{{- end -}}
{{- else -}}
{{- with .Params.tool_guide_slug -}}
{{- $slug := . -}}
{{- $tool := dict -}}
{{- range partial "tools/registry.html" $ -}}
  {{- if eq .id $slug }}{{ $tool = . }}{{ end -}}
{{- end -}}
{{- $guide := partial "tools/guide.html" $slug -}}
# {{ $.Title }}

{{ with $.Description }}{{ . }}

{{ end -}}
- Tool: {{ printf "%stools/%s/" site.BaseURL $slug }}
- Guide URL: {{ $.Permalink }}
- Tool guides index: {{ "guides/tools/" | absURL }}
{{- with $.Params.broader_guide }}
- Broader guide: {{ .title }} ({{ .url | absURL }})
{{- end }}

{{ $tool.description }}

## What it does

{{ with $guide.about }}{{ . }}{{ else }}{{ $tool.description }}{{ end }}

## What to try

Open {{ printf "%stools/%s/" site.BaseURL $slug }} and start with a small example or the controls on the page. Check what happens before moving to real data. The questions below cover details that may not be obvious from the first result.

## What goes in and comes out

- Input: {{ with $tool.input.format }}{{ . }} {{ end }}{{ $tool.input.type | default "text" }}.
- Output: {{ with $tool.output.format }}{{ . }} {{ end }}{{ $tool.output.type | default "text" }}.
- Find it under: {{ $tool.category_name }}.

## Where your input goes

{{- if eq $tool.privacy.processing "client-side" }}
Processing happens locally in your browser. This tool does not upload the input to ilham.dev.
{{- else if eq $tool.privacy.processing "third-party-api" }}
This tool needs a network request to complete the lookup or test. Send only data you are comfortable sharing with the target service.
{{- else }}
Processing model: {{ $tool.privacy.processing }}.
{{- end }}

{{- with $tool.use_cases }}

## When it helps

{{- range . }}
- {{ . }}
{{- end }}
{{- end }}

{{- with $tool.limitations }}

## What to watch for

{{- range . }}
- {{ . }}
{{- end }}
{{- end }}

{{- with $guide.faq }}

## Questions you might have

{{- range . }}

### {{ .q }}

{{ .a }}
{{- end }}
{{- end -}}
{{- else -}}
# {{ $.Title }}

{{ $.RawContent }}
{{- end -}}
{{- end -}}
