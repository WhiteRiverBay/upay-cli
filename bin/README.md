# 归集脚本使用方法

## 导出充值钱包数据

### 1 所有的evm格式钱包

```shell
# 第一个参数是upay部署地址，第二个参数是类型（evm或tron），第三个参数是ga的验证码
filename_evm=$(sh dump_data.sh https://youruayapi.com evm 123456)
```

### 2 所有的tron格式钱包

```shell
# 第一个参数是upay部署地址，第二个参数是类型（evm或tron），第三个参数是ga的验证码
filename_tron=$(sh dump_data.sh https://youruayapi.com tron 123456)
```

## 空投手续费

```shell
# 三个参数，分别是公链名称、prepare sh脚本输出的文件、大约可以执行几笔归集交易的手续费
sh airdrop_gas.sh bsc $wallet_file 5
```

## 执行归集

```shell
# 三个参数，分别是公链名称、prepare脚本产生的文件、管理员私钥文件
sh collect.sh bsc $wallet_file /tmp/private.pem
```
