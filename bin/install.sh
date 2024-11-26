#!/bin/bash

function install_deps {
    # is node install or version is less than 20.16.0 ?
    if [ ! -x "$(command -v node)" ] || [ "$(node -v)" ] <"v12.16.0"; then
        echo "installing nodejs"
        install_node
    fi

    echo "installing dependencies"
    npm install -g upay-cli

    # check if jq is installed
    if [ ! -x "$(command -v jq)" ]; then
        install_component jq
    fi

    # install bc
    if [ ! -x "$(command -v bc)" ]; then
        install_component bc
    fi
}

function install_component {
    if [ -x "$(command -v apt-get)" ]; then
        sudo apt-get install $1
    elif [ -x "$(command -v yum)" ]; then
        sudo yum install $1
    elif [ -x "$(command -v brew)" ]; then
        brew install $1
    else
        echo "please install $1 manually"
    fi
}

function install_node {
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
    nvm install 22
    node -v # should print `v22.11.0`
    npm -v  # should print `10.9.0`
}

# if upay-cli is not installed, install it
if [ ! -x "$(command -v upay-cli)" ]; then
    install_deps
fi

echo "upay-cli is installed"