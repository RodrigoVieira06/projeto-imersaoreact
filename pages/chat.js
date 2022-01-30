import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker.js';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzUwMjg1NywiZXhwIjoxOTU5MDc4ODU3fQ.iDqN5eDAQpxXCgdJ9T4pn7GkkVEb2xWTiYcaQxp0tGU';
const SUPABASE_URL = 'https://bgngxroxhfqfqdsbxwcv.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
        .from('mensagens')
        .on('INSERT', (respostaLive) => {
            adicionaMensagem(respostaLive.new);
        })
        .subscribe();
}

export default function ChatPage() {
    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagens, setListaDeMensagens] = React.useState([]);

    React.useEffect(() => {
        supabaseClient
            .from('mensagens')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                // console.log('Dados da consulta:', data);
                setListaDeMensagens(data);
            });

        const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
            console.log('Nova mensagem:', novaMensagem);
            console.log('listaDeMensagens:', listaDeMensagens);
            setListaDeMensagens((valorAtualDaLista) => {
                console.log('valorAtualDaLista:', valorAtualDaLista);
                return [
                    novaMensagem,
                    ...valorAtualDaLista,
                ]
            });
        });

        return () => {
            subscription.unsubscribe();
        }
    }, []);

    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            // id: listaDeMensagens.length + 1,
            de: usuarioLogado,
            texto: novaMensagem,
        };

        supabaseClient
            .from('mensagens')
            .insert([
                mensagem
            ])
            .then(({ data }) => {
                console.log('Criando mensagem: ', data);
            });

        setMensagem('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: 'url(https://steamuserimages-a.akamaihd.net/ugc/1792974219414330352/'+
                '80533F1CA1E801B141FD0BED318F0C446E6808A2/?imw=637&imh=358&ima=fit&impolicy=Letterbox'+
                '&imcolor=%23000000&letterbox=true)',
                backgroundRepeat: 'no-repeat', 
                backgroundSize: 'cover', 
                backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[701],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        display: 'flex'
                    }}
                >
                    <Box
                        styleSheet={{
                            position: 'absolute',
                            display: 'flex',
                            flexGrow: 0,
                            width: '90%',
                            height: '80%',
                            backgroundColor: appConfig.theme.colors.neutrals[901],
                            flexDirection: 'column',
                            borderRadius: '5px',
                            padding: '16px',
                        }}
                    >
                        <MessageList mensagens={listaDeMensagens} />
                        <Box
                            as="form"
                            onSubmit={function (event) {
                                event.preventDefault();
                                handleNovaMensagem(mensagem);
                            }}
                            styleSheet={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <ButtonSendSticker
                                onStickerClick={(sticker) => {
                                    handleNovaMensagem(':sticker: ' + sticker);
                                }}
                            />
                            <TextField
                                value={mensagem}
                                onChange={(event) => {
                                    const valor = event.target.value;
                                    setMensagem(valor);
                                }}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        handleNovaMensagem(mensagem);
                                    }
                                }}
                                placeholder="Fala com a BatGalera..."
                                type="textarea"
                                styleSheet={{
                                    width: '100%',
                                    border: '0',
                                    resize: 'none',
                                    borderRadius: '5px',
                                    padding: '6px 8px',
                                    backgroundColor: appConfig.theme.colors.neutrals[800],
                                    marginRight: '12px',
                                    color: appConfig.theme.colors.neutrals[200],
                                }}
                            />
                            <Button
                                styleSheet={{
                                    height: "70%",
                                    marginRight: '12px',
                                    marginBottom: '6px'
                                }}
                                type='submit'
                                label='BatEnvia'
                                buttonColors={{
                                    contrastColor: appConfig.theme.colors.neutrals["100"],
                                    mainColor: appConfig.theme.colors.primary[500],
                                    mainColorLight: appConfig.theme.colors.primary[100],
                                    mainColorStrong: appConfig.theme.colors.primary[600],
                                }}
                            >
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{
                width: '100%', 
                marginBottom: '16px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }} >
                <Text variant='heading4'>
                    BatPapo 🦇
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='BatSair'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    // console.log(props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                            />
                            <Text tag="strong">
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {/* [Declarativo] */}
                        {/* Condicional: {mensagem.texto.startsWith(':sticker:').toString()} */}
                        {mensagem.texto.startsWith(':sticker:')
                            ? (
                                <Image src={mensagem.texto.replace(':sticker:', '')} />
                            )
                            : (
                                mensagem.texto
                            )}
                        {/* if mensagem de texto possui stickers:
                           mostra a imagem
                        else 
                           mensagem.texto */}
                        {/* {mensagem.texto} */}
                    </Text>
                );
            })}
        </Box>
    )
}