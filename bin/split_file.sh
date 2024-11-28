#!/bin/bash

source ./env.sh

# 检查输入参数
if [ $# -lt 1 ]; then
    echo "Usage: $0 <Input File> "
    exit 1
fi


# 输入文件路径和输出文件前缀
input_file=$1

OUTPUT_DIR=$DATA_DIR/prepared/splited/$input_file
if [ ! -d $OUTPUT_DIR ]; then
    mkdir -p $OUTPUT_DIR
fi

# 每个文件的记录行数 - 255
lines_per_file=255

# 使用 split 命令切割文件并放到OUTPUT_DIR目录下
split -l $lines_per_file "$input_file" "${OUTPUT_DIR}/"

# 重命名文件以添加编号后缀
counter=1
for file in $OUTPUT_DIR/*; do
    mv "$file" "$OUTPUT_DIR/$counter.tmp"
    ((counter++))
done

echo $OUTPUT_DIR