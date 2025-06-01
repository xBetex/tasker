import os

def concatenate_tsx_files(directory_path, output_file):
    # Verifica se o diretório existe
    if not os.path.isdir(directory_path):
        print(f"\nErro: O diretório '{directory_path}' não existe.")
        return False

    # Lista todos os arquivos no diretório
    try:
        files = os.listdir(directory_path)
    except Exception as e:
        print(f"\nErro ao ler o diretório: {e}")
        return False

    # Filtra apenas os arquivos .tsx
    tsx_files = [f for f in files if f.lower().endswith('.tsx')]

    if not tsx_files:
        print(f"\nNenhum arquivo .tsx encontrado em '{directory_path}'.")
        return False

    # Abre o arquivo de saída para escrita
    try:
        with open(output_file, 'w', encoding='utf-8') as out_file:
            for file in tsx_files:
                file_path = os.path.join(directory_path, file)
                
                # Escreve o cabeçalho
                out_file.write(f"### === Inicio de {file} === ###\n\n")
                
                # Lê e escreve o conteúdo do arquivo
                try:
                    with open(file_path, 'r', encoding='utf-8') as in_file:
                        out_file.write(in_file.read())
                except Exception as e:
                    print(f"\nErro ao ler o arquivo {file_path}: {e}")
                    continue
                
                # Escreve o rodapé e adiciona espaços entre arquivos
                out_file.write(f"\n\n### === Fim de {file} === ###\n\n\n")
        
        print(f"\nSucesso: {len(tsx_files)} arquivos foram concatenados em '{output_file}'")
        return True
    except Exception as e:
        print(f"\nErro ao escrever no arquivo de saída: {e}")
        return False

def main():
    print("\n=== Concatenador de Arquivos TSX ===")
    print("Este script concatena todos os arquivos .tsx de uma pasta")
    print("adicionando cabeçalhos e rodapés para cada arquivo.\n")
    
    # Solicita o caminho da pasta
    while True:
        directory_path = input("Digite o caminho da pasta com os arquivos .tsx: ").strip()
        if directory_path:
            break
        print("Por favor, digite um caminho válido.")

    # Solicita o nome do arquivo de saída
    while True:
        output_file = input("Digite o nome do arquivo de saída (ex: concatenado.txt): ").strip()
        if output_file:
            break
        print("Por favor, digite um nome válido para o arquivo de saída.")

    # Executa a concatenação
    concatenate_tsx_files(directory_path, output_file)

    # Mantém o console aberto (opcional)
    input("\nPressione Enter para sair...")

if __name__ == "__main__":
    main()