import os
import re
import markdown
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
HTML_DIR = BASE_DIR / "html"

CSS_STYLE = """
:root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-card: #1e293b;
    --bg-hover: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    --accent-light: #60a5fa;
    --border: #334155;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --gradient-4: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    --gradient-5: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    --gradient-6: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.7;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo {
    font-size: 1.5rem;
    font-weight: 700;
    background: var(--gradient-1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
}

.search-box {
    position: relative;
    width: 300px;
}

.search-box input {
    width: 100%;
    padding: 0.625rem 1rem 0.625rem 2.5rem;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    color: var(--text-primary);
    font-size: 0.875rem;
    transition: all 0.2s;
}

.search-box input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.hero {
    padding: 4rem 0;
    text-align: center;
    background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
}

.hero h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: var(--gradient-1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
}

.nav-section {
    padding: 2rem 0 4rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 2rem 0 1rem;
    color: var(--text-primary);
}

.nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.nav-card {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    text-decoration: none;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
}

.nav-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--card-gradient, var(--gradient-1));
}

.nav-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
    border-color: var(--accent);
}

.nav-card-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.nav-card-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.nav-card-desc {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
}

.nav-card-count {
    display: inline-block;
    background: var(--bg-primary);
    color: var(--text-muted);
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-md);
    font-size: 0.75rem;
    margin-top: 1rem;
}

.content-page {
    padding: 2rem 0 4rem;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    font-size: 0.875rem;
    color: var(--text-muted);
}

.breadcrumb a {
    color: var(--accent-light);
    text-decoration: none;
    transition: color 0.2s;
}

.breadcrumb a:hover {
    color: var(--accent);
}

.content-header {
    margin-bottom: 2rem;
}

.content-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
}

.toc {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    position: sticky;
    top: 5rem;
    max-height: calc(100vh - 6rem);
    overflow-y: auto;
    align-self: start;
}

.toc::-webkit-scrollbar {
    width: 4px;
}

.toc::-webkit-scrollbar-track {
    background: transparent;
}

.toc::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 2px;
}

.toc-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
}

.toc-list {
    list-style: none;
}

.toc-list li {
    margin-bottom: 0.25rem;
}

.toc-list a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-md);
    display: block;
    transition: all 0.2s;
}

.toc-list a:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.toc-list a.active {
    background: var(--accent);
    color: #fff;
    font-weight: 600;
}

.menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: background 0.2s;
}

.menu-btn:hover {
    background: var(--bg-hover);
}

.menu-btn svg {
    width: 24px;
    height: 24px;
}

.sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 199;
}

.sidebar-overlay.active {
    display: block;
}

.sidebar {
    position: fixed;
    top: 0;
    left: -300px;
    width: 280px;
    height: 100vh;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    z-index: 200;
    overflow-y: auto;
    transition: left 0.3s ease;
    padding: 1.5rem;
}

.sidebar.active {
    left: 0;
}

.sidebar .toc-title {
    font-size: 1rem;
    margin-top: 0;
}

.sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: var(--radius-md);
    float: right;
    margin-bottom: 1rem;
}

.sidebar-close:hover {
    background: var(--bg-hover);
}

.sidebar-close svg {
    width: 20px;
    height: 20px;
}

.content-body h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 2.5rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
    color: var(--text-primary);
    scroll-margin-top: 5rem;
}

.content-body h3 {
    font-size: 1.375rem;
    font-weight: 600;
    margin: 2rem 0 0.75rem;
    color: var(--text-primary);
    scroll-margin-top: 5rem;
}

.content-body h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 1.5rem 0 0.5rem;
    color: var(--text-primary);
    scroll-margin-top: 5rem;
}

.content-body p {
    margin-bottom: 1rem;
    color: var(--text-secondary);
}

.content-body ul, .content-body ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    color: var(--text-secondary);
}

.content-body li {
    margin-bottom: 0.5rem;
}

.content-body code {
    background: var(--bg-secondary);
    padding: 0.2rem 0.4rem;
    border-radius: var(--radius-sm);
    font-size: 0.875em;
    color: var(--accent-light);
}

.content-body pre {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
    overflow-x: auto;
}

.content-body pre code {
    background: none;
    padding: 0;
    color: var(--text-primary);
}

.content-body table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.content-body th, .content-body td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border);
}

.content-body th {
    background: var(--bg-hover);
    font-weight: 600;
    color: var(--text-primary);
}

.content-body td {
    color: var(--text-secondary);
}

.content-body tr:hover td {
    background: var(--bg-hover);
}

.content-body blockquote {
    border-left: 4px solid var(--accent);
    background: var(--bg-secondary);
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.content-body blockquote p {
    margin-bottom: 0;
    color: var(--text-secondary);
}

.content-body hr {
    border: none;
    height: 1px;
    background: var(--border);
    margin: 2rem 0;
}

.chapter-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
}

.chapter-nav-item {
    display: flex;
    flex-direction: column;
    padding: 1rem 1.25rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition: all 0.2s;
}

.chapter-nav-item:hover {
    background: var(--bg-hover);
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.chapter-nav-item.disabled {
    opacity: 0.3;
    pointer-events: none;
}

.chapter-nav-item.prev {
    justify-content: flex-start;
}

.chapter-nav-item.next {
    justify-content: flex-end;
    text-align: right;
}

.chapter-nav-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.chapter-nav-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--accent-light);
}

.content-layout {
    display: grid;
    grid-template-columns: 1fr 250px;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.content-body {
    min-width: 0;
}

.toc {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    position: sticky;
    top: 5rem;
    max-height: calc(100vh - 6rem);
    overflow-y: auto;
    align-self: start;
}

@media (max-width: 1024px) {
    .content-layout {
        grid-template-columns: 1fr;
    }
    
    .toc {
        display: none;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }
    
    .header-content {
        gap: 0.75rem;
    }
    
    .menu-btn {
        display: flex;
    }
    
    .logo {
        font-size: 1.25rem;
    }
    
    .search-box {
        width: 100%;
        order: 3;
    }
    
    .hero {
        padding: 2rem 0;
    }
    
    .hero h1 {
        font-size: 2rem;
    }
    
    .hero p {
        font-size: 1rem;
    }
    
    .nav-grid {
        grid-template-columns: 1fr;
    }
    
    .nav-card {
        padding: 1.25rem;
    }
    
    .content-header h1 {
        font-size: 1.5rem;
    }
    
    .content-body h2 {
        font-size: 1.5rem;
    }
    
    .content-body h3 {
        font-size: 1.25rem;
    }
    
    .content-body pre {
        padding: 0.75rem 1rem;
        font-size: 0.8rem;
    }
    
    .content-body table {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }
    
    .chapter-nav {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .container {
        padding: 0 0.75rem;
    }
    
    .logo {
        font-size: 1.1rem;
    }
    
    .hero h1 {
        font-size: 1.5rem;
    }
    
    .hero p {
        font-size: 0.9rem;
    }
    
    .nav-card {
        padding: 1rem;
    }
    
    .nav-card-icon {
        font-size: 1.5rem;
    }
    
    .nav-card-title {
        font-size: 1rem;
    }
    
    .nav-card-desc {
        font-size: 0.8rem;
    }
    
    .content-header h1 {
        font-size: 1.25rem;
    }
    
    .content-body h2 {
        font-size: 1.25rem;
        margin: 1.5rem 0 0.75rem;
    }
    
    .content-body h3 {
        font-size: 1.1rem;
        margin: 1.25rem 0 0.5rem;
    }
    
    .content-body p,
    .content-body ul,
    .content-body ol {
        font-size: 0.9rem;
    }
    
    .content-body code {
        font-size: 0.8rem;
    }
    
    .content-body pre {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
    }
    
    .content-body blockquote {
        padding: 0.75rem 1rem;
    }
    
    .chapter-nav {
        gap: 0.5rem;
    }
    
    .chapter-nav-item {
        padding: 0.75rem 1rem;
    }
    
    .breadcrumb {
        font-size: 0.8rem;
    }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.nav-card {
    animation: fadeIn 0.3s ease-out both;
}

.nav-card:nth-child(1) { animation-delay: 0.05s; }
.nav-card:nth-child(2) { animation-delay: 0.1s; }
.nav-card:nth-child(3) { animation-delay: 0.15s; }
.nav-card:nth-child(4) { animation-delay: 0.2s; }
.nav-card:nth-child(5) { animation-delay: 0.25s; }
.nav-card:nth-child(6) { animation-delay: 0.3s; }
"""

FILE_CONFIG = {
    "通用方法论": {
        "icon": "📊",
        "gradient": "var(--gradient-1)",
        "desc": "数据策略、训练策略、模型融合、工程实践",
        "files": [
            "01_数据策略与特征工程.md",
            "02_训练策略与正则化.md",
            "03_模型融合与后处理.md",
            "04_超参数调优与工程实践.md",
        ]
    },
    "CV竞赛": {
        "icon": "🖼️",
        "gradient": "var(--gradient-2)",
        "desc": "计算机视觉任务类型、数据增强、损失函数、检测后处理",
        "files": [
            "09_任务类型与模型架构.md",
            "10_数据增强与输入管线.md",
            "11_损失函数与训练策略.md",
            "12_检测后处理与框融合.md",
        ]
    },
    "NLP竞赛": {
        "icon": "📝",
        "gradient": "var(--gradient-3)",
        "desc": "预训练模型、文本分类、命名实体识别、数据增强",
        "files": [
            "05_预训练模型详解.md",
            "06_文本分类.md",
            "07_命名实体识别.md",
            "08_数据增强与输入处理.md",
        ]
    },
    "推荐系统竞赛": {
        "icon": "🎯",
        "gradient": "var(--gradient-4)",
        "desc": "召回算法、排序与多目标优化",
        "files": [
            "18_召回算法.md",
            "19_排序与多目标.md",
        ]
    },
    "时间序列竞赛": {
        "icon": "📈",
        "gradient": "var(--gradient-5)",
        "desc": "赛题理解、建模方法、量化交易、因子挖掘",
        "files": [
            "13_赛题理解与数据分析.md",
            "14_建模方法与策略.md",
            "15_量化交易背景与多因子模型.md",
            "16_深度学习与因子挖掘.md",
            "17_模型调参与AutoML.md",
        ]
    },
    "参考指南": {
        "icon": "📚",
        "gradient": "var(--gradient-6)",
        "desc": "技术使用时机、决策路径、元策略、金牌方案",
        "files": [
            "20_技术使用时机指南.md",
            "21_任务决策路径.md",
            "22_竞赛元策略.md",
            "23_数据泄露与外部数据.md",
            "24_金牌方案核心Trick.md",
            "25_实战Pipeline模板.md",
            "26_音频竞赛核心方法.md",
            "27_Agent竞赛优化技巧.md",
        ]
    },
}


def convert_markdown_to_html(md_content):
    md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc'])
    html_body = md.convert(md_content)
    return html_body


def get_toc_from_html(html_body):
    """Extract headings in document order (interleaved h2/h3)"""
    toc_items = []
    pattern = re.compile(r'<h([23])[^>]*>(.*?)</h\1>', re.DOTALL)
    
    for match in pattern.finditer(html_body):
        level = match.group(1)
        title = re.sub(r'<[^>]+>', '', match.group(2)).strip()
        toc_items.append((f'h{level}', title))
    
    return toc_items


def add_anchor_ids(html_body):
    """Add unique IDs to h2/h3 headings, removing any existing IDs first"""
    pattern = re.compile(r'<h([23])([^>]*)>(.*?)</h\1>', re.DOTALL)
    
    def add_id(match):
        level = match.group(1)
        attrs = match.group(2)
        title = match.group(3)
        title_text = re.sub(r'<[^>]+>', '', title).strip()
        
        anchor = re.sub(r'[^\w\s-]', '', title_text).strip().lower()
        anchor = re.sub(r'[-\s]+', '-', anchor)
        
        if level == '3':
            anchor = 'sub-' + anchor
        
        attrs = re.sub(r'\s*id="[^"]*"', '', attrs)
        return f'<h{level}{attrs} id="{anchor}">{title}</h{level}>'
    
    return pattern.sub(add_id, html_body)


def generate_toc_html(toc_items):
    if not toc_items:
        return ""
    
    html = '<ul class="toc-list">'
    
    for level, title in toc_items:
        anchor = re.sub(r'[^\w\s-]', '', title).strip().lower()
        anchor = re.sub(r'[-\s]+', '-', anchor)
        if level == 'h3':
            anchor = 'sub-' + anchor
        
        indent = 'style="padding-left: 1rem;"' if level == 'h3' else ''
        html += f'<li {indent}><a href="#{anchor}">{title}</a></li>'
    
    html += '</ul>'
    return html


def generate_sidebar_toc(toc_items):
    if not toc_items:
        return ""
    
    html = '<div class="toc-title">目录</div>'
    html += '<ul class="toc-list">'
    
    for level, title in toc_items:
        anchor = re.sub(r'[^\w\s-]', '', title).strip().lower()
        anchor = re.sub(r'[-\s]+', '-', anchor)
        if level == 'h3':
            anchor = 'sub-' + anchor
        
        indent = 'style="padding-left: 1rem;"' if level == 'h3' else ''
        html += f'<li {indent}><a href="#{anchor}">{title}</a></li>'
    
    html += '</ul>'
    return html


def generate_page_html(title, content_html, toc_items, category=None, prev_file=None, next_file=None):
    toc_html = generate_toc_html(toc_items)
    sidebar_toc = generate_sidebar_toc(toc_items)
    
    breadcrumb_html = ""
    if category:
        breadcrumb_html = f'''
        <div class="breadcrumb">
            <a href="../index.html">首页</a>
            <span>/</span>
            <span>{category}</span>
        </div>
        '''
    
    prev_html = ""
    if prev_file:
        prev_html = f'<a href="{prev_file["path"]}" class="chapter-nav-item prev"><span class="chapter-nav-label">上一章</span><span class="chapter-nav-title">{prev_file["title"]}</span></a>'
    else:
        prev_html = '<div class="chapter-nav-item prev disabled"><span class="chapter-nav-label">上一章</span><span class="chapter-nav-title">无</span></div>'
    
    next_html = ""
    if next_file:
        next_html = f'<a href="{next_file["path"]}" class="chapter-nav-item next"><span class="chapter-nav-label">下一章</span><span class="chapter-nav-title">{next_file["title"]}</span></a>'
    else:
        next_html = '<div class="chapter-nav-item next disabled"><span class="chapter-nav-label">下一章</span><span class="chapter-nav-title">无</span></div>'
    
    chapter_nav_html = f'<div class="chapter-nav">{prev_html}{next_html}</div>'
    
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Kaggle竞赛指南</title>
    <style>
{CSS_STYLE}
    </style>
</head>
<body>
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
    <div class="sidebar" id="sidebar">
        <button class="sidebar-close" onclick="closeSidebar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        {sidebar_toc}
    </div>
    
    <header class="header">
        <div class="container header-content">
            <button class="menu-btn" onclick="openSidebar()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <a href="../index.html" class="logo">Kaggle竞赛指南</a>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="搜索内容..." onkeyup="searchContent()">
            </div>
        </div>
    </header>
    
    <main class="content-page">
        <div class="container">
            {breadcrumb_html}
            
            <div class="content-header">
                <h1>{title}</h1>
            </div>
            
            <div class="content-layout">
                <div class="content-body" id="contentBody">
                    {content_html}
                </div>
                
                <div class="toc" id="tocDesktop">
                    <div class="toc-title">目录</div>
                    {toc_html}
                </div>
            </div>
            
            {chapter_nav_html}
        </div>
    </main>
    
    <script>
        function openSidebar() {{
            document.getElementById('sidebar').classList.add('active');
            document.getElementById('sidebarOverlay').classList.add('active');
            document.body.style.overflow = 'hidden';
        }}
        
        function closeSidebar() {{
            document.getElementById('sidebar').classList.remove('active');
            document.getElementById('sidebarOverlay').classList.remove('active');
            document.body.style.overflow = '';
        }}
        
        function searchContent() {{
            const query = document.getElementById('searchInput').value.toLowerCase();
            const content = document.getElementById('contentBody');
            const sections = content.querySelectorAll('h2, h3, p, li, td');
            
            sections.forEach(section => {{
                const text = section.textContent.toLowerCase();
                if (query && text.includes(query)) {{
                    section.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    section.style.borderRadius = '4px';
                }} else {{
                    section.style.backgroundColor = '';
                }}
            }});
        }}
        
        document.querySelectorAll('.toc-list a, .sidebar .toc-list a').forEach(link => {{
            link.addEventListener('click', function(e) {{
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {{
                    target.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
                    if (window.innerWidth <= 768) {{
                        closeSidebar();
                    }}
                }}
            }});
        }});
        
        (function() {{
            const tocLinks = document.querySelectorAll('.toc-list a');
            const headings = [];
            
            tocLinks.forEach(link => {{
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {{
                    const id = href.substring(1);
                    const heading = document.getElementById(id);
                    if (heading) {{
                        headings.push({{ el: heading, link: link }});
                    }}
                }}
            }});
            
            headings.sort((a, b) => a.el.offsetTop - b.el.offsetTop);
            
            function setActiveLink() {{
                if (headings.length === 0) return;
                
                const headerOffset = 100;
                let currentIndex = 0;
                
                for (let i = headings.length - 1; i >= 0; i--) {{
                    const rect = headings[i].el.getBoundingClientRect();
                    const absoluteTop = rect.top + window.scrollY;
                    if (absoluteTop - headerOffset <= window.scrollY) {{
                        currentIndex = i;
                        break;
                    }}
                }}
                
                const prevActive = document.querySelector('.toc-list a.active');
                const newActive = headings[currentIndex].link;
                
                if (prevActive === newActive) return;
                
                document.querySelectorAll('.toc-list a, .sidebar .toc-list a').forEach(l => l.classList.remove('active'));
                newActive.classList.add('active');
                
                const sidebarLink = document.querySelector('.sidebar .toc-list a[href="' + newActive.getAttribute('href') + '"]');
                if (sidebarLink) sidebarLink.classList.add('active');
                
                const tocContainer = document.querySelector('.toc');
                if (tocContainer) {{
                    const linkTop = newActive.offsetTop;
                    const padding = 10;
                    tocContainer.scrollTop = linkTop - padding;
                }}
            }}
            
            window.addEventListener('scroll', setActiveLink, {{ passive: true }});
            setActiveLink();
        }})();
    </script>
</body>
</html>'''


def generate_index_html():
    cards_html = ""
    
    for category, config in FILE_CONFIG.items():
        files_html = ""
        for filename in config["files"]:
            file_path = BASE_DIR / category / filename
            if file_path.exists():
                title = filename.replace('.md', '').split('_', 1)[1] if '_' in filename else filename.replace('.md', '')
                files_html += f'''
                <a href="{category}/{filename.replace('.md', '.html')}" class="nav-card" style="--card-gradient: {config['gradient']}">
                    <div class="nav-card-icon">{config['icon']}</div>
                    <div class="nav-card-title">{title}</div>
                    <div class="nav-card-desc">{config['desc']}</div>
                    <span class="nav-card-count">{category}</span>
                </a>'''
        
        cards_html += f'''
        <div class="section-title">{config['icon']} {category}</div>
        <div class="nav-grid">
            {files_html}
        </div>'''
    
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kaggle竞赛指南</title>
    <style>
{CSS_STYLE}
    </style>
</head>
<body>
    <header class="header">
        <div class="container header-content">
            <a href="index.html" class="logo">Kaggle竞赛指南</a>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="搜索内容..." onkeyup="searchContent()">
            </div>
        </div>
    </header>
    
    <section class="hero">
        <div class="container">
            <h1>Kaggle竞赛指南</h1>
            <p>系统整理 Kaggle 竞赛核心技术与方法论，涵盖 NLP、CV、推荐系统、时间序列等多模态任务</p>
        </div>
    </section>
    
    <main class="nav-section">
        <div class="container">
            {cards_html}
        </div>
    </main>
    
    <script>
        function searchContent() {{
            const query = document.getElementById('searchInput').value.toLowerCase();
            const cards = document.querySelectorAll('.nav-card');
            
            cards.forEach(card => {{
                const text = card.textContent.toLowerCase();
                if (query && !text.includes(query)) {{
                    card.style.display = 'none';
                }} else {{
                    card.style.display = '';
                }}
            }});
        }}
    </script>
</body>
</html>'''


def main():
    index_html = generate_index_html()
    with open(HTML_DIR / "index.html", 'w', encoding='utf-8') as f:
        f.write(index_html)
    print("Generated index.html")
    
    all_files = []
    for category, config in FILE_CONFIG.items():
        for filename in config["files"]:
            md_path = BASE_DIR / category / filename
            if md_path.exists():
                all_files.append((category, filename, md_path))
    
    for idx, (category, filename, md_path) in enumerate(all_files):
        with open(md_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        html_body = convert_markdown_to_html(md_content)
        html_body = add_anchor_ids(html_body)
        toc_items = get_toc_from_html(html_body)
        
        title_match = re.match(r'# (.+)', md_content)
        title = title_match.group(1) if title_match else filename
        
        prev_file = None
        next_file = None
        
        if idx > 0:
            prev_category, prev_filename, _ = all_files[idx - 1]
            prev_title = prev_filename.replace('.md', '').split('_', 1)[1] if '_' in prev_filename else prev_filename.replace('.md', '')
            if prev_category == category:
                prev_path = prev_filename.replace('.md', '.html')
            else:
                prev_path = f"../{prev_category}/{prev_filename.replace('.md', '.html')}"
            prev_file = {"path": prev_path, "title": prev_title}
        
        if idx < len(all_files) - 1:
            next_category, next_filename, _ = all_files[idx + 1]
            next_title = next_filename.replace('.md', '').split('_', 1)[1] if '_' in next_filename else next_filename.replace('.md', '')
            if next_category == category:
                next_path = next_filename.replace('.md', '.html')
            else:
                next_path = f"../{next_category}/{next_filename.replace('.md', '.html')}"
            next_file = {"path": next_path, "title": next_title}
        
        page_html = generate_page_html(title, html_body, toc_items, category, prev_file, next_file)
        
        category_dir = HTML_DIR / category
        category_dir.mkdir(exist_ok=True)
        
        output_filename = filename.replace('.md', '.html')
        with open(category_dir / output_filename, 'w', encoding='utf-8') as f:
            f.write(page_html)
        
        print(f"Generated {category}/{output_filename}")
    
    print("\nAll pages generated successfully!")


if __name__ == "__main__":
    main()
