# deno-symbol-cli

Symbol Cli tool with Deno

## Install

Change `--name` option.

```sh
deno install --force --name desy --allow-env --allow-read --allow-net main.ts
```

## Usage

```

  Usage:   Deno Symbol Cli
  Version: 0.1.0          

  Description:

    Symbol Cli tool with Deno

  Options:

    -h, --help                  - Show this help.                                         
    -V, --version               - Show the version number for this program.               
    -e, --endpoint  [endpoint]  - Symbol API Endpoint                        (Default: "")

  Commands:

    help      [command]  - Show this help or the help of a sub-command.
    tx        <hash>     - Get transaction info from hash              
    payload   <payload>  - Get decoded transaction from payload        
    account   <account>  - Get account info from address or public key 
    block     <height>   - Get block info from block number            
    mosaic    <id>       - Get mosaic info from mosaic id              
    chain                - Get current chain info                      
    validate  <address>  - Check if valid address
```

## Example

```sh
desy tx -e https://00.symbol-node.eu:3001 708BD3A74CCE27C8D1A6D6002A853705CAF174CC6FFABCFDBD3D159EE2B1E1F2
```
