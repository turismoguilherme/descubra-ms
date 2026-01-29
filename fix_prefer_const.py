#!/usr/bin/env python3
"""
Script para corrigir prefer-const - trocar let por const quando variável não é reatribuída
"""
import re
import sys

def fix_prefer_const(file_path, line_numbers):
    """Corrige let por const nas linhas especificadas"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        fixed = False
        for line_num in sorted(line_numbers, reverse=True):  # Reverso para não afetar índices
            idx = line_num - 1  # Converter para índice 0-based
            if idx < len(lines):
                line = lines[idx]
                # Substituir let por const apenas se não houver reatribuição na mesma linha
                # e se não for um loop for
                if re.match(r'^\s*let\s+', line) and 'for' not in line.lower():
                    new_line = re.sub(r'^\s*let\s+', lambda m: m.group(0).replace('let', 'const'), line, count=1)
                    if new_line != line:
                        lines[idx] = new_line
                        fixed = True
        
        if fixed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True
        return False
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}", file=sys.stderr)
        return False

if __name__ == '__main__':
    # Ler arquivo:linha do stdin ou argumentos
    fixes = {}
    for line in sys.stdin:
        if ':' in line:
            file_path, line_str = line.strip().split(':', 1)
            line_num = int(line_str)
            if file_path not in fixes:
                fixes[file_path] = []
            fixes[file_path].append(line_num)
    
    fixed_count = 0
    for file_path, line_numbers in fixes.items():
        if fix_prefer_const(file_path, line_numbers):
            print(f"Corrigido: {file_path}")
            fixed_count += 1
    
    print(f"\nTotal de arquivos corrigidos: {fixed_count}")

