"""Rebuild the captured site and new Markdown lessons. Original old builder is absent."""
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import argparse
import hashlib
import json
import math
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent / 'vendor'))
import markdown


def render_markdown(text):
    # Authors may use folded Markdown without having to remember a parser attribute.
    text = re.sub(r'<details(?![^>]*\bmarkdown=)([^>]*)>', r'<details markdown="1"\1>', text)
    result = markdown.markdown(text, extensions=['extra', 'toc', 'sane_lists'], output_format='html')
    result = result.replace('<table>', '<div class="tw"><table>').replace('</table>', '</table></div>')
    return result


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []

    def handle_data(self, data):
        self.text.append(data)


def minutes(body):
    parser = VisibleText()
    parser.feed(body)
    return max(1, math.ceil(len(re.sub(r'\s', '', ''.join(parser.text))) / 170))


def safe_path(root, relative):
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError('Path escapes repository: ' + relative)
    return path


def render_lesson(root, entry):
    template = safe_path(root, entry['template']).read_text(encoding='utf-8')
    source = safe_path(root, entry['source']).read_text(encoding='utf-8')
    body = render_markdown(source)
    estimated = minutes(body)
    badge = '<p class="reading-time">⏱ <strong>阅读约 ' + str(estimated) + ' 分钟</strong> · 动手实践另计</p>'
    body = re.sub(r'(</h1>)', lambda m: m[1] + '\n' + badge, body, count=1)
    prefix = template.split('<main>', 1)[0]
    board_title = entry.get('board_title', Path(entry['output']).parts[0])
    prefix = re.sub(r'<title>.*?</title>', '<title>' + escape(entry['title']) + ' · ' + escape(board_title) + '</title>', prefix, count=1)
    prefix = re.sub(r'(<span class="title">).*?(</span>)', lambda m: m[1] + escape(entry['title']) + m[2], prefix, count=1)
    top_nav = '<span class="prevnext">'
    for kind, arrow in [('previous', '←'), ('next', '→')]:
        link = entry[kind]
        top_nav += '<a href="' + escape(link['href'], quote=True) + '" aria-label="' + escape(link['title'], quote=True) + '">' + arrow + '</a> '
    top_nav += '</span>'
    prefix, top_count = re.subn(r'<span class="prevnext">.*?</span>', lambda _: top_nav, prefix, count=1, flags=re.S)
    if top_count != 1:
        raise ValueError('Template has no unambiguous top navigation: ' + entry['template'])
    suffix = template[template.index('<div class="donebar">'):]
    nav = '<nav class="pagenav">'
    for kind in ['previous', 'next']:
        link = entry[kind]
        css = ' class="next"' if kind == 'next' else ''
        direction = ('完成 →' if link['href'] == 'index.html' else '下一节 →') if kind == 'next' else '← 上一节'
        nav += '<a' + css + ' href="' + escape(link['href'], quote=True) + '"><div class="dir">' + direction + '</div>' + escape(link['title']) + '</a>'
    nav += '</nav>'
    suffix = re.sub(r'<nav class="pagenav">.*?</nav>', lambda _: nav, suffix, count=1, flags=re.S)
    suffix, progress_count = re.subn(r'(var KEY="[^"]+",\s*FILE=).*?;', lambda m: m[1] + json.dumps(Path(entry['source']).name, ensure_ascii=True) + ';', suffix, count=1)
    if progress_count != 1:
        raise ValueError('Template has no unambiguous lesson progress key: ' + entry['template'])
    if 'id="interview-search"' in body:
        prefix = prefix.replace('</head>', '<link rel="stylesheet" href="../assets/interview-cards.css"></head>')
        suffix = suffix.replace('</body>', '<script defer src="../assets/interview-cards.js"></script></body>')
    return prefix + '<main>\n' + body + '\n' + suffix


def build(root, entries):
    root = Path(root).resolve()
    for entry in entries:
        source = safe_path(root, entry['source'])
        target = safe_path(root, entry['output'])
        if entry['kind'] == 'recovered_html':
            data = source.read_bytes()
        elif entry['kind'] == 'markdown':
            data = render_lesson(root, entry).encode('utf-8')
        else:
            raise ValueError('Unknown source kind: ' + entry['kind'])
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.read_bytes() != data:
            target.write_bytes(data)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument('--check', action='store_true', help='Verify outputs match sources without changing pages')
    args = parser.parse_args()
    mapping = json.loads((args.root / '_src/source-map.json').read_text(encoding='utf-8'))
    if args.check:
        errors = []
        for entry in mapping['entries']:
            want = (safe_path(args.root, entry['source']).read_bytes() if entry['kind'] == 'recovered_html'
                    else render_lesson(args.root, entry).encode('utf-8'))
            output = safe_path(args.root, entry['output'])
            if not output.is_file() or output.read_bytes() != want:
                errors.append(entry['output'])
        print(json.dumps({'status': 'fail' if errors else 'pass', 'sources': len(mapping['entries']), 'out_of_sync': errors}, ensure_ascii=False))
        raise SystemExit(bool(errors))
    build(args.root, mapping['entries'])
    print('Built ' + str(len(mapping['entries'])) + ' pages from recovered HTML and new Markdown sources.')
