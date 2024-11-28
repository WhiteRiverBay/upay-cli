#!/bin/bash

# 检查输入参数
if [ $# -lt 2 ]; then
    echo "Usage: $0 <Input File> <Output Filename Prefix>"
    exit 1
fi

# 输入文件路径和输出文件前缀
input_file=$1
output_prefix=$2

# 每个文件的记录行数 - 255
lines_per_file=255

# 使用 split 命令切割文件
split -l $lines_per_file "$input_file" "${output_prefix}_"

# 重命名文件以添加编号后缀
counter=1
for file in ${output_prefix}_*; do
    mv "$file" "${output_prefix}_${counter}"
    counter=$((counter + 1))
done

echo "File splited, there are $lines_per_file lines per file.  $output_prefix"1~$(counter-1)" files created."
