import { Project } from './project.model';

const agn_project_collection: Project[] = [
    {
        _id: "101001",
        t_project: 'proyecto',
        compPrefix: 'PRO',
        compName:'Proyecto',
        compNum: 1001,
        isFantasma: false,
      
        slug: 'Ingesta Fondo Vernet',
        description: 'Revisión, identificación e ingesta del fondo Vernet',
        fe_comp_tx : '22/02/2022',
        fe_comp_ts : 10000001,
      
        // estado
        estado: 'activo',
        navance: 'enproceso',
      
        // parent
        parentProjectId: null,
        parentProjectSlug: '',
        rootProjectId: '',
      
        // Encuadre
        sector: 'escritos',
        udaHook: {
            fondoId: 'vernet_mongo_id',
            udaId: 'serie_vernet_id',
            title: 'Serie vernet',
            reference_code: ['AR', 'AGN', 'VERNET01', 'serie_vernet'],
            identifier: "serie_vernet",
            level_of_description: 'serie_facticia'
        },
      
        // Acciones relevadas
        actionList: ['digitalizacion', 'ingesta', 'invanalitico', 'perfeccionam', 'qc'],
        actionTokens: [
            {
                c_action: 'digitalizacion',     // string; // es unique para un dado proyecto
                q_nom_accion: 15,     // number;
                q_desag_accion: 8,     // number;
                fe_accion_tx: '01/02/2022',     // string;
                fe_accion_ts: 10000001,     // number;
            
                q_nom_realizado: 5,
                q_desag_realizado: 5,
                fe_realizado_tx: '22/02/2022',
                fe_realizado_ts: 100001,
                
                q_nom_verificado: 1,
                q_desag_verificado: 1,
                fe_verificado_tx: '25/02/2022',
                fe_verificado_ts: 10000001,
              
                ume_item: 'UCO',
                isDesagregado: true,
                t_item: 'uco', // uco|folder
                c_ubi: 'isla01', // ubicacionOptList: deposito, conservación; isla;
                estado: 'activo',
                avance: 'en_proceso',
                observacion: 'plan demorado',
              
                fe_prev_inicio_tx: '01/01/2022',
                fe_prev_inicio_ts: 1000001,
                fe_prev_final_tx: '01/04/2022',
                fe_prev_final_ts: 100001,                
            }
        ],
        
        // equipo coordinador
        teamList: [
            {
                userId: 'user_mongo_id',
                username: 'alejo@mininterior.gob.ar',
                role: 'project_owner' // roleOptList;
            },
            {
                userId: 'user_mongo_id',
                username: 'jonatan@mininterior.gob.ar',
                role: 'digitalizacion' // roleOptList;
            },
            {
                userId: 'user_mongo_id',
                username: 'gabriela@mininterior.gob.ar',
                role: 'ingesta' // roleOptList;
            },

        ],
      
        // Hitos
        hitosList:  [
            {
                fecha_hito_tx: '30/04/2022',
                fecha_hito_ts: 100001,
                t_hito: 'ingesta', // hitoOptList
                q_hito: 2,
                q_ume: 'UCO',
              
                slug: 'Prueba de concepto',
                descripcion: 'Ingesta de 2 cajas para verificar la configuración'
            }
        ],
      
        q_project: {
            q_item: 15,
            ume_item: 'UCO',
            id_item: '', // mongoId si se trata de un item
            t_item: 'uco', //itemTypeOptList: uco|folder
            c_ubi: 'escritos', // ubicacionOptList: deposito, conservación; isla;
          
        }
      
    }

    
]