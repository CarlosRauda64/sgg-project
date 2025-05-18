Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NDRkNWVhNy0zZDUzLTRhMjctODM2Yy1mOGRiMjQwMzllNzEiLCJpZCI6MzAxNTU3LCJpYXQiOjE3NDcwMTE4MDF9.yJhtoi6X8NYz8YGp_79DMymdNxXpt7UIbQet3bwUNSY';

const geoServerWorkspace = 'SGG';
const geoServerWmsUrl = `https://geo.sggproject.me/geoserver/${geoServerWorkspace}/wms`;

const elSalvadorBoundingBox = [-90.15, 13.10, -87.60, 14.50];

const vistaHome2D_ElSalvador = Cesium.Rectangle.fromDegrees(
    elSalvadorBoundingBox[0],
    elSalvadorBoundingBox[1],
    elSalvadorBoundingBox[2],
    elSalvadorBoundingBox[3]
);

const puntoDestinoLonCamara3D = -88.95;
const puntoDestinoLatCamara3D = 13.794185 - 1.5;
const altitudVistaHome3D = 145000;
const orientacionVistaHome3D = {
    heading: Cesium.Math.toRadians(0.0),
    pitch: Cesium.Math.toRadians(-40.0),
    roll: 0.0
};
const vistaHome3D_ElSalvador = {
    destination: Cesium.Cartesian3.fromDegrees(
        puntoDestinoLonCamara3D,
        puntoDestinoLatCamara3D,
        altitudVistaHome3D
    ),
    orientation: orientacionVistaHome3D,
    duration: 1.5
};

const divisionesAdministrativas = {
    "Ahuachapán": { municipios: { "Ahuachapán Centro": ["Ahuachapán", "Apaneca", "Concepción de Ataco", "Tacuba"], "Ahuachapán Norte": ["Atiquizaya", "El Refugio", "San Lorenzo", "Turín"], "Ahuachapán Sur": ["Guaymango", "Jujutla", "San Francisco Menéndez", "San Pedro Puxtla"] } },
    "Santa Ana": { municipios: { "Santa Ana Centro": ["Santa Ana"], "Santa Ana Este": ["Coatepeque", "El Congo"], "Santa Ana Norte": ["Masahuat", "Metapán", "Santa Rosa Guachipilín", "Texistepeque"], "Santa Ana Oeste": ["Candelaria de la Frontera", "Chalchuapa", "El Porvenir", "San Antonio Pajonal", "San Sebastián Salitrillo", "Santiago de la Frontera"] } },
    "La Libertad": { municipios: { "La Libertad Centro": ["Ciudad Arce", "San Juan Opico"], "La Libertad Costa": ["Chiltiupán", "Jicalapa", "La Libertad", "Tamanique", "Teotepeque"], "La Libertad Este": ["Antiguo Cuscatlán", "Huizúcar", "Nuevo Cuscatlán", "San José Villanueva", "Zaragoza"], "La Libertad Norte": ["Quezaltepeque", "San Matías", "San Pablo Tacachico"], "La Libertad Oeste": ["Colón", "Jayaque", "Sacacoyo", "Talnique", "Tepecoyo"], "La Libertad Sur": ["Comasagua", "Santa Tecla"] } },
    "San Salvador": { municipios: { "San Salvador Centro": ["Ayutuxtepeque", "Delgado", "Cuscatancingo", "Mejicanos", "San Salvador"], "San Salvador Este": ["Ilopango", "San Martín", "Soyapango", "Tonacatepeque"], "San Salvador Norte": ["Aguilares", "El Paisnal", "Guazapa"], "San Salvador Oeste": ["Apopa", "Nejapa"], "San Salvador Sur": ["Panchimalco", "Rosario de Mora", "San Marcos", "Santiago Texacuangos", "Santo Tomás"] } },
    "Usulután": { municipios: { "Usulután Este": ["California", "Concepción Batres", "Ereguayquín", "Jucuarán", "Ozatlán", "San Dionisio", "Santa Elena", "Santa María", "Tecapán", "Usulután"], "Usulután Norte": ["Alegría", "Berlín", "El Triunfo", "Estanzuelas", "Jucuapa", "Mercedes Umaña", "Nueva Granada", "San Buenaventura", "Santiago de María"], "Usulután Oeste": ["Jiquilisco", "Puerto El Triunfo", "San Agustín", "San Francisco Javier"] } },
    "San Miguel": { municipios: { "San Miguel Centro": ["Chirilagua", "Comacarán", "Moncagua", "Quelepa", "San Miguel", "Uluazapa"], "San Miguel Norte": ["Carolina", "Chapeltique", "Ciudad Barrios", "Nuevo Edén de San Juan", "San Antonio", "San Gerardo", "San Luis de la Reina", "Sesori"], "San Miguel Oeste": ["Chinameca", "El Tránsito", "Lolotique", "Nueva Guadalupe", "San Jorge", "San Rafael"] } }
};

const departamentoSelectGlobal = document.getElementById('departamentoSelectGlobal');
const municipioSelectGlobal = document.getElementById('municipioSelectGlobal');
const distritoSelectGlobal = document.getElementById('distritoSelectGlobal');
const deburgaSelectGlobal = document.getElementById('deburgaSelectGlobal');
const resetFiltersButton = document.getElementById('resetFiltersButton');

const cesiumLayersConfig = {
    superficie: { name: `${geoServerWorkspace}:superficie`, title: 'Superficie', imageryLayer: null, toggleId: 'toggleSuperficie', currentFilter: "INCLUDE", type: 'raster', legend: false, zIndex: 0, allowGetFeatureInfo: false },
    temperatura: { name: `${geoServerWorkspace}:temperatura`, title: 'Temperatura (LST)', imageryLayer: null, toggleId: 'toggleTemperatura', currentFilter: "INCLUDE", type: 'raster', legend: true, zIndex: 5, allowGetFeatureInfo: false },
    vegetacion: { name: `${geoServerWorkspace}:vegetacion`, title: 'Vegetación (NDVI)', imageryLayer: null, toggleId: 'toggleVegetacion', currentFilter: "INCLUDE", type: 'raster', legend: true, zIndex: 4, allowGetFeatureInfo: false },
    suelos: { name: `${geoServerWorkspace}:Uso de Suelo`, title: 'Uso de Suelo', imageryLayer: null, toggleId: 'toggleSuelos', currentFilter: "INCLUDE", type: 'raster', legend: true, zIndex: 3, allowGetFeatureInfo: false },
    departamento: {
        name: `${geoServerWorkspace}:departamento`, title: 'Departamentos', imageryLayer: null, toggleId: 'toggleDepartamento', filterField: 'adm1_es', currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 10, infoFormat: 'application/json', allowGetFeatureInfo: true,
        attributeAliases: { 'adm1_es':'Departamento', 'adm0_es':'País', 'area_sqkm':'Área (km²)' },
        attributesToHide:['adm1_ref', 'adm1_pcode', 'adm0_pcode', 'date', 'validon', 'shape_leng', 'shape_area']
    },
    municipios: {
        name: `${geoServerWorkspace}:municipio`, title: 'Municipios', imageryLayer: null, toggleId: 'toggleMunicipios', filterField: 'adm2_es', currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 11, infoFormat: 'application/json', allowGetFeatureInfo: true,
        attributeAliases: { 'adm2_es':'Municipio', 'adm1_es':'Departamento', 'adm0_es':'País', 'area_sqkm':'Área (km²)' },
        attributesToHide:['adm2_pcode', 'adm2_ref', 'adm1_pcode', 'adm0_pcode', 'date', 'validon', 'shape_leng', 'shape_area']
    },
    distrito: {
        name: `${geoServerWorkspace}:distrito`, title: 'Distritos', imageryLayer: null, toggleId: 'toggleDistrito', filterField: 'adm3_es', currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 12, infoFormat: 'application/json', allowGetFeatureInfo: true,
        attributeAliases: { 'adm3_es': 'Distrito', 'adm2_es':'Municipio', 'adm1_es':'Departamento', 'adm0_es':'País', 'area_sqkm':'Área (km²)' },
        attributesToHide:['adm3_pcode', 'adm3_ref', 'adm2_pcode', 'adm1_pcode', 'adm0_pcode', 'date', 'validon', 'shape_leng', 'shape_area']
    },
    cuerposAgua: {
        name: `${geoServerWorkspace}:cuerposAgua`, title: 'Cuerpos de Agua', imageryLayer: null, toggleId: 'toggleCuerpos', currentFilter: "INCLUDE", type: 'vector', legend: true, zIndex: 13, infoFormat: 'application/json', allowGetFeatureInfo: true,
        attributeAliases: { 'fclass': 'Clase', 'name':'Nombre' },
        attributesToHide:['osm_id', 'code']
    },
    deburga: {
        name: `${geoServerWorkspace}:deburga`, title: 'DEGURBA', imageryLayer: null, toggleId: 'toggleDeburga', filterField: 'class', currentFilter: "INCLUDE", type: 'vector', legend: true, zIndex: 14, infoFormat: 'application/json', allowGetFeatureInfo: true,
        attributeAliases: { 'sum_person': 'Población Total', 'sum_hogare': 'Hogares Totales', 'sum_vivien': 'Viviendas Totales', 'class': 'Clasificación DEGURBA', 'nivel': 'Nivel DEGURBA', 'nombre_dep': 'Departamento', 'nombre_mun': 'Municipio', 'nombre_dis': 'Distrito', 'densidad': 'Densidad Poblacional (hab/km²)' },
        attributesToHide: [ 'fid', 'objectid', 'cod', 'id_depto', 'id_mun', 'id_distrit', 'sum_area_k', 'objectid_1', 'select_dis', 'select_mun', 'select_dep', 'shape__are', 'shape__len' ]
    },
    construcciones: {
        name: `${geoServerWorkspace}:construcciones`, title: 'Construcciones', imageryLayer: null, toggleId: 'toggleConstrucciones', currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 15, infoFormat: 'application/json', allowGetFeatureInfo: true,
        attributeAliases: { 'osm_id': 'ID OSM', 'name': 'Nombre', 'type': 'Tipo', 'code': 'Código', 'fclass': 'Clase Funcional' }
    },
    rios: { name: `${geoServerWorkspace}:rios`, title: 'Ríos y vías de agua', imageryLayer: null, toggleId: 'toggleRios', currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 16, allowGetFeatureInfo: true },
    carreteras: { name: `${geoServerWorkspace}:carreteras`, title: 'Carreteras', imageryLayer: null, toggleId: 'toggleCarreteras', currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 17, allowGetFeatureInfo: true }
};

let viewer;
let screenSpaceEventHandler = null;

/**
 * Obtiene los parámetros de la vista Home (inicial) de la aplicación,
 * ajustándose si el visor está en modo 2D o 3D/Columbus View.
 * @returns {object} Objeto con 'destination' y 'duration' para la animación de la cámara.
 */
function getAppHomeViewParameters() {
    if (viewer && viewer.scene.mode === Cesium.SceneMode.SCENE2D) {
        return { destination: vistaHome2D_ElSalvador, duration: 1.5 };
    } else {
        return vistaHome3D_ElSalvador;
    }
}

/**
 * Inicializa la aplicación CesiumJS.
 * Configura el proveedor de terreno, crea el visor Cesium,
 * establece la vista inicial de la cámara, personaliza el botón Home
 * y configura el manejador de eventos para la selección de características (InfoBox).
 */
async function initializeCesiumApp() {
    let terrainProviderInstance;
    try {
        terrainProviderInstance = await Cesium.createWorldTerrainAsync({
            requestWaterMask: true,
            requestVertexNormals: true
        });
    } catch (error) {
        console.error("Error al crear el proveedor de terreno:", error);
        alert("Error al cargar el terreno mundial. Verifique su token de Cesium Ion y la conexión a internet.");
        terrainProviderInstance = undefined;
    }

    try {
        viewer = new Cesium.Viewer('cesiumContainer', {
            terrainProvider: terrainProviderInstance,
            animation: false,
            timeline: false,
            homeButton: true,
            sceneModePicker: true,
            baseLayerPicker: true,
            geocoder: false,
            navigationHelpButton: false,
            infoBox: true,
        });
        console.log("Visor de CesiumJS inicializado.");

        viewer.camera.flyTo(getAppHomeViewParameters());

        if (viewer.homeButton) {
            viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
                viewer.camera.flyTo(getAppHomeViewParameters());
                commandInfo.cancel = true;
            });
        }

    } catch (viewerError) {
        console.error("Error al inicializar el Cesium.Viewer:", viewerError);
        alert("Error crítico al inicializar el visor de Cesium. Revisa la consola.");
        return;
    }

    if (screenSpaceEventHandler && !screenSpaceEventHandler.isDestroyed()) {
        screenSpaceEventHandler.destroy();
    }
    screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    screenSpaceEventHandler.setInputAction(function (movement) {
        const ray = viewer.camera.getPickRay(movement.position);
        if (!ray) return;

        const imageryFeaturesPromise = viewer.imageryLayers.pickImageryLayerFeatures(ray, viewer.scene);

        if (!Cesium.defined(imageryFeaturesPromise)) {
            if (viewer.selectedEntity && movement.position) {
                viewer.selectedEntity = undefined;
            }
            return;
        }

        imageryFeaturesPromise.then(function (pickedImageryFeatures) {
            let customInfoBoxHandled = false;
            if (Cesium.defined(pickedImageryFeatures) && pickedImageryFeatures.length > 0) {
                for (let i = 0; i < pickedImageryFeatures.length; i++) {
                    const feature = pickedImageryFeatures[i];

                    if (feature.imageryLayer) {
                        const layerConfigKey = Object.keys(cesiumLayersConfig).find(key =>
                            cesiumLayersConfig[key].imageryLayer === feature.imageryLayer
                        );
                        const config = layerConfigKey ? cesiumLayersConfig[layerConfigKey] : null;

                            if (config && config.allowGetFeatureInfo === false) {
                                viewer.selectedEntity = undefined;
                                customInfoBoxHandled = true;
                                break;
                            }

                        let layerTitle = config ? (config.title || feature.imageryLayer.imageryProvider.layers) : feature.imageryLayer.imageryProvider.layers;
                        let entityIdSuffix = Math.random().toString(36).substring(7);

                        if (config && layerConfigKey === 'carreteras') {
                            const customEntity = new Cesium.Entity({
                                id: `custom-${layerConfigKey}-infobox-entity`,
                                name: layerTitle,
                                description: '<div style="padding:10px;">Carretera</div>'
                            });
                            viewer.selectedEntity = customEntity;
                            customInfoBoxHandled = true;
                            break;
                        }
                        else if (config && layerConfigKey === 'rios') {
                            const customEntity = new Cesium.Entity({
                                id: `custom-${layerConfigKey}-infobox-entity`,
                                name: layerTitle,
                                description: '<div style="padding:10px;">Río o Vía de Agua</div>'
                            });
                            viewer.selectedEntity = customEntity;
                            customInfoBoxHandled = true;
                            break;
                        }
                        else if (config) {
                            let descriptionHtml = '';
                            if (feature.properties && (config.attributeAliases || config.attributesToHide)) {
                                descriptionHtml = '<table class="cesium-infoBox-defaultTable"><tbody>';
                                let hasContent = false;
                                for (const key in feature.properties) {
                                    if (Object.hasOwnProperty.call(feature.properties, key)) {
                                        let hideAttribute = false;
                                        if (config.attributesToHide) {
                                            if (config.attributesToHide.includes(key)) {
                                                hideAttribute = true;
                                            } else {
                                                for (const prefixToHide of ['select_']) {
                                                    if (key.startsWith(prefixToHide) && config.attributesToHide.some(item => item.startsWith(prefixToHide))) {
                                                        hideAttribute = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        if (hideAttribute) continue;

                                        if (feature.properties[key] !== null &&
                                            feature.properties[key] !== undefined &&
                                            String(feature.properties[key]).trim() !== '') {

                                            if (typeof feature.properties[key] === 'object' && feature.properties[key] !== null && feature.properties[key].type && feature.properties[key].coordinates) {
                                                continue;
                                            }

                                            const displayName = (config.attributeAliases && config.attributeAliases[key])
                                                ? config.attributeAliases[key]
                                                : key.charAt(0).toUpperCase() + key.slice(1);

                                            descriptionHtml += `<tr><th style="padding: 4px; border: 1px solid #ddd; font-weight: bold; vertical-align: top; text-align:left;">${displayName}</th><td style="padding: 4px; border: 1px solid #ddd; vertical-align: top; text-align:left;">${feature.properties[key]}</td></tr>`;
                                            hasContent = true;
                                            if (key.toLowerCase() === 'fid' || key.toLowerCase() === 'id' || key.toLowerCase().includes('id') || key.toLowerCase() === 'osm_id') {
                                                entityIdSuffix = String(feature.properties[key]).replace(/\W/g, '');
                                            }
                                        }
                                    }
                                }
                                descriptionHtml += '</tbody></table>';
                                if (!hasContent) {
                                    descriptionHtml = '<div style="padding:10px;">No hay información de atributos para mostrar.</div>';
                                }
                            } else if (feature.description) {
                                descriptionHtml = feature.description;
                                 if (feature.name) entityIdSuffix = feature.name.replace(/\W/g, '');
                            } else {
                                descriptionHtml = '<div style="padding:10px;">Información no disponible.</div>';
                            }

                            const genericEntity = new Cesium.Entity({
                                id: `generic-infobox-${layerTitle.replace(/\W/g, '')}-${entityIdSuffix}`,
                                name: layerTitle,
                                description: descriptionHtml
                            });
                            viewer.selectedEntity = genericEntity;
                            customInfoBoxHandled = true;
                            break;
                        }
                    }
                }
            }
            if (!customInfoBoxHandled && pickedImageryFeatures && pickedImageryFeatures.length === 0 && viewer.selectedEntity && movement.position) {
                viewer.selectedEntity = undefined;
            }
        }).catch(function (error) {
            console.error("Error al seleccionar características de la capa de imágenes:", error);
        });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    setupEventListeners();
    applyInitialLayerVisibility();
}

/**
 * Crea y retorna un proveedor de imágenes WMS (WebMapServiceImageryProvider) de Cesium.
 * @param {string} layerName - El nombre de la capa en GeoServer (workspace:layer).
 * @param {string} [cqlFilter="INCLUDE"] - El filtro CQL a aplicar a la capa.
 * @param {string} [infoFormat='text/html'] - El formato para GetFeatureInfo.
 * @param {boolean} [enablePick=true] - Habilita o deshabilita la selección de características (picking).
 * @returns {Cesium.WebMapServiceImageryProvider} El proveedor de imágenes WMS configurado.
 */
function createWMSImageryProvider(layerName, cqlFilter = "INCLUDE", infoFormat = 'text/html', enablePick = true) {
    return new Cesium.WebMapServiceImageryProvider({
        url: geoServerWmsUrl,
        layers: layerName,
        parameters: {
            transparent: true,
            format: 'image/png',
            CQL_FILTER: cqlFilter,
            VERSION: '1.1.1',
        },
        getFeatureInfoParameters: {
            INFO_FORMAT: infoFormat,
            FEATURE_COUNT: 10
        },
        enablePickFeatures: enablePick
    });
}

/**
 * Actualiza el orden de todas las capas visibles en el visor Cesium.
 * Primero, identifica las capas que deben estar visibles según los checkboxes.
 * Luego, ordena estas capas por su 'zIndex' configurado.
 * Finalmente, remueve todas las capas gestionadas existentes y las vuelve a agregar en el nuevo orden.
 */
function updateAllVisibleLayersOrder() {
    if (!viewer) return;

    const layersToShow = [];
    for (const key in cesiumLayersConfig) {
        const config = cesiumLayersConfig[key];
        const toggleCheckbox = document.getElementById(config.toggleId);

        if (toggleCheckbox && toggleCheckbox.checked) {
            layersToShow.push({
                key: key,
                name: config.name,
                filter: config.currentFilter,
                zIndex: config.zIndex !== undefined ? config.zIndex : 0,
                infoFormat: config.infoFormat,
                allowGetFeatureInfo: config.allowGetFeatureInfo
            });
        }
    }

    layersToShow.sort((a, b) => a.zIndex - b.zIndex);

    const imageryLayersCopy = [...viewer.imageryLayers._layers];
    imageryLayersCopy.forEach(layerInstance => {
        const managedKey = Object.keys(cesiumLayersConfig).find(key => cesiumLayersConfig[key].imageryLayer === layerInstance);
        if (managedKey) {
            viewer.imageryLayers.remove(layerInstance, true);
            cesiumLayersConfig[managedKey].imageryLayer = null;
        }
    });

    layersToShow.forEach(layerData => {
        const enablePicking = layerData.allowGetFeatureInfo === undefined ? true : layerData.allowGetFeatureInfo;
        const provider = createWMSImageryProvider(
            layerData.name,
            layerData.filter,
            layerData.infoFormat || 'text/html',
            enablePicking
        );
        const cesiumLayer = viewer.imageryLayers.addImageryProvider(provider);
        cesiumLayersConfig[layerData.key].imageryLayer = cesiumLayer;
    });
}

/**
 * Muestra la leyenda gráfica para una capa específica.
 * Construye la URL para la solicitud GetLegendGraphic a GeoServer y la muestra en el div correspondiente.
 * @param {string} layerKey - La clave de la capa en `cesiumLayersConfig` para la cual mostrar la leyenda.
 */
function displayIndividualLayerLegend(layerKey) {
    const config = cesiumLayersConfig[layerKey];
    const legendContentDiv = document.getElementById(`legend-content-${layerKey}`);

    if (!config || !legendContentDiv || !config.legend) {
        if (legendContentDiv) legendContentDiv.innerHTML = '';
        return;
    }

    legendContentDiv.innerHTML = '<p class="text-xs text-gray-400 italic">Cargando leyenda...</p>';
    const layerName = config.name;

    let legendOptionsArray = [
        "fontName:SansSerif", "fontSize:10", "fontAntiAliasing:true",
        "forceLabels:on", "labelMargin:2", "dx:0.2", "dy:0.2", "mx:0.2", "my:0.2",
        "border:false",
    ];

    const legendOptionsString = legendOptionsArray.join(';');
    const imageWidth = 120;
    const imageHeight = "";

    const legendUrl = `${geoServerWmsUrl}?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&LAYER=${layerName}&STYLE=` +
        `&WIDTH=${imageWidth}` +
        (imageHeight ? `&HEIGHT=${imageHeight}` : '') +
        `&LEGEND_OPTIONS=${encodeURIComponent(legendOptionsString)}`;

    const img = document.createElement('img');
    img.src = legendUrl;
    img.alt = `Leyenda ${config.title}`;

    img.onload = function () {
        legendContentDiv.innerHTML = '';
        legendContentDiv.appendChild(img);
    };
    img.onerror = function () {
        console.error(`Error al cargar la leyenda para: ${layerName} desde ${legendUrl}`);
        legendContentDiv.innerHTML = `<p class="text-xs text-red-400 italic">Leyenda no disp.</p>`;
    };
}

/**
 * Configura los listeners de eventos para los controles de la interfaz de usuario.
 * Esto incluye los checkboxes para activar/desactivar capas, los botones de información de leyenda,
 * y los selectores de filtro globales (departamento, municipio, distrito, DEGURBA).
 */
function setupEventListeners() {
    for (const key in cesiumLayersConfig) {
        const config = cesiumLayersConfig[key];
        const toggleCheckbox = document.getElementById(config.toggleId);
        const legendInfoButton = document.querySelector(`.legend-info-btn[data-layerkey="${key}"]`);
        const legendContentDiv = document.getElementById(`legend-content-${key}`);

        if (toggleCheckbox) {
            toggleCheckbox.addEventListener('change', (event) => {
                const isChecked = event.target.checked;
                if (config.type === 'raster' && ['temperatura', 'vegetacion', 'suelos', 'superficie'].includes(key)) {
                    manejarActivacionRaster(key, isChecked);
                } else {
                    updateAllVisibleLayersOrder();
                }

                if (config.legend && legendInfoButton) {
                    legendInfoButton.style.display = isChecked ? 'inline-block' : 'none';
                    if (!isChecked && legendContentDiv) {
                        legendContentDiv.style.display = 'none';
                        legendContentDiv.innerHTML = '';
                        legendInfoButton.classList.remove('active');
                    }
                }
            });
        }

        if (config.legend && legendInfoButton && legendContentDiv) {
            legendInfoButton.addEventListener('click', () => {
                const isLegendVisible = legendContentDiv.style.display === 'block';
                if (isLegendVisible) {
                    legendContentDiv.style.display = 'none';
                    legendInfoButton.classList.remove('active');
                } else {
                    legendContentDiv.style.display = 'block';
                    legendInfoButton.classList.add('active');
                    displayIndividualLayerLegend(key);
                }
            });
        }
    }

    if (departamentoSelectGlobal) {
        departamentoSelectGlobal.addEventListener('change', function () {
            populateMunicipioSelect(this.value);
            applyAllFilters();
        });
    }
    if (municipioSelectGlobal) {
        municipioSelectGlobal.addEventListener('change', function () {
            populateDistritoSelect(departamentoSelectGlobal.value, this.value);
            applyAllFilters();
        });
    }
    if (distritoSelectGlobal) distritoSelectGlobal.addEventListener('change', applyAllFilters);
    if (deburgaSelectGlobal) deburgaSelectGlobal.addEventListener('change', applyAllFilters);
    if (resetFiltersButton) resetFiltersButton.addEventListener('click', resetAllFilters);
}

/**
 * Aplica la visibilidad inicial de las capas al cargar la aplicación.
 * Actualiza el orden de las capas visibles y ajusta la visualización de los botones de leyenda.
 * También maneja la lógica inicial para las capas ráster.
 */
function applyInitialLayerVisibility() {
    updateAllVisibleLayersOrder();
    for (const key in cesiumLayersConfig) {
        const config = cesiumLayersConfig[key];
        const toggleCheckbox = document.getElementById(config.toggleId);
        const legendInfoButton = document.querySelector(`.legend-info-btn[data-layerkey="${key}"]`);
        if (toggleCheckbox && legendInfoButton && config.legend) {
            legendInfoButton.style.display = toggleCheckbox.checked ? 'inline-block' : 'none';
        }
    }
    manejarActivacionRaster(null, false);
}

/**
 * Popula el selector de municipios basado en el departamento seleccionado.
 * Limpia y deshabilita el selector de distritos.
 * @param {string} departamentoNombre - El nombre del departamento seleccionado.
 */
function populateMunicipioSelect(departamentoNombre) {
    municipioSelectGlobal.innerHTML = '<option value="">-- Seleccione --</option>';
    distritoSelectGlobal.innerHTML = '<option value="">-- Seleccione --</option>';
    distritoSelectGlobal.disabled = true;
    distritoSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    distritoSelectGlobal.classList.remove('bg-white');

    if (departamentoNombre && divisionesAdministrativas[departamentoNombre]) {
        const dataDepartamento = divisionesAdministrativas[departamentoNombre];
        if (dataDepartamento && dataDepartamento.municipios) {
            for (const municipioNombre in dataDepartamento.municipios) {
                const option = document.createElement('option');
                option.value = municipioNombre;
                option.textContent = municipioNombre;
                municipioSelectGlobal.appendChild(option);
            }
            municipioSelectGlobal.disabled = false;
            municipioSelectGlobal.classList.remove('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
            municipioSelectGlobal.classList.add('bg-white');
        } else {
            municipioSelectGlobal.disabled = true;
            municipioSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
        }
    } else {
        municipioSelectGlobal.disabled = true;
        municipioSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    }
}

/**
 * Popula el selector de distritos basado en el departamento y municipio seleccionados.
 * @param {string} departamentoNombre - El nombre del departamento seleccionado.
 * @param {string} municipioNombre - El nombre del municipio seleccionado.
 */
function populateDistritoSelect(departamentoNombre, municipioNombre) {
    distritoSelectGlobal.innerHTML = '<option value="">-- Seleccione --</option>';
    if (departamentoNombre && municipioNombre &&
        divisionesAdministrativas[departamentoNombre] &&
        divisionesAdministrativas[departamentoNombre].municipios &&
        divisionesAdministrativas[departamentoNombre].municipios[municipioNombre]) {

        const distritos = divisionesAdministrativas[departamentoNombre].municipios[municipioNombre];
        distritos.forEach(distritoNombre => {
            const option = document.createElement('option');
            option.value = distritoNombre;
            option.textContent = distritoNombre;
            distritoSelectGlobal.appendChild(option);
        });
        distritoSelectGlobal.disabled = false;
        distritoSelectGlobal.classList.remove('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
        distritoSelectGlobal.classList.add('bg-white');
    } else {
        distritoSelectGlobal.disabled = true;
        distritoSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    }
}

/**
 * Aplica los filtros CQL a las capas correspondientes (departamento, municipios, distrito, DEGURBA)
 * basado en los valores seleccionados en los dropdowns globales.
 * Luego, actualiza el orden de las capas visibles.
 */
function applyAllFilters() {
    const depSelected = departamentoSelectGlobal.value;
    const munSelected = municipioSelectGlobal.value;
    const disSelected = distritoSelectGlobal.value;
    const debSelected = deburgaSelectGlobal.value;

    if (cesiumLayersConfig.departamento) {
        cesiumLayersConfig.departamento.currentFilter = depSelected ? `${cesiumLayersConfig.departamento.filterField} = '${depSelected}'` : "INCLUDE";
    }
    if (cesiumLayersConfig.municipios) {
        let cqlMun = "INCLUDE";
        if (depSelected) {
            cqlMun = `adm1_es = '${depSelected}'`;
            if (munSelected) cqlMun += ` AND ${cesiumLayersConfig.municipios.filterField} = '${munSelected}'`;
        }
        cesiumLayersConfig.municipios.currentFilter = cqlMun;
    }
    if (cesiumLayersConfig.distrito) {
        let cqlDis = "INCLUDE";
        if (depSelected) {
            cqlDis = `adm1_es = '${depSelected}'`;
            if (munSelected) {
                cqlDis += ` AND adm2_es = '${munSelected}'`;
                if (disSelected) cqlDis += ` AND ${cesiumLayersConfig.distrito.filterField} = '${disSelected}'`;
            }
        }
        cesiumLayersConfig.distrito.currentFilter = cqlDis;
    }
    if (cesiumLayersConfig.deburga) {
        cesiumLayersConfig.deburga.currentFilter = debSelected ? `${cesiumLayersConfig.deburga.filterField} = '${debSelected}'` : "INCLUDE";
    }
    updateAllVisibleLayersOrder();
}

/**
 * Restablece todos los filtros a sus valores predeterminados.
 * Limpia los valores de los selectores de filtro, restablece los filtros CQL de las capas
 * a "INCLUDE", actualiza el orden de las capas y vuela la cámara a la vista inicial.
 */
function resetAllFilters() {
    if (departamentoSelectGlobal) departamentoSelectGlobal.value = "";
    populateMunicipioSelect("");
    if (deburgaSelectGlobal) deburgaSelectGlobal.value = "";

    ['departamento', 'municipios', 'distrito', 'deburga'].forEach(key => {
        if (cesiumLayersConfig[key]) {
            cesiumLayersConfig[key].currentFilter = "INCLUDE";
        }
    });

    updateAllVisibleLayersOrder();

    if (viewer) {
        viewer.camera.flyTo(getAppHomeViewParameters());
    }
}

let activeRasterLayerKey = null;
const thematicRasterKeys = ['temperatura', 'vegetacion', 'suelos'];

/**
 * Maneja la lógica de activación y desactivación de las capas ráster.
 * Asegura que solo una capa ráster temática (temperatura, vegetación, suelos) esté activa a la vez.
 * Si una capa temática se activa, también activa la capa base 'superficie' si no lo está.
 * Si se desactiva la capa 'superficie' mientras una temática está activa, previene la desactivación
 * o maneja la lógica para mantener la consistencia.
 * @param {string | null} changedLayerKey - La clave de la capa ráster que cambió su estado (o null en la inicialización).
 * @param {boolean} isChecked - El nuevo estado (marcado/desmarcado) del checkbox de la capa.
 */
function manejarActivacionRaster(changedLayerKey, isChecked) {
    const superficieConfig = cesiumLayersConfig.superficie;
    const superficieChk = document.getElementById(superficieConfig.toggleId);
    let needsLayerReorder = false;

    if (changedLayerKey && (thematicRasterKeys.includes(changedLayerKey) || changedLayerKey === 'superficie')) {
        needsLayerReorder = true;

        if (thematicRasterKeys.includes(changedLayerKey)) {
            if (isChecked) {
                activeRasterLayerKey = changedLayerKey;
                thematicRasterKeys.forEach(key => {
                    if (key !== changedLayerKey) {
                        const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
                        if (chk && chk.checked) {
                            chk.checked = false;
                            const legendBtn = document.querySelector(`.legend-info-btn[data-layerkey="${key}"]`);
                            const legendDiv = document.getElementById(`legend-content-${key}`);
                            if (legendBtn) legendBtn.style.display = 'none';
                            if (legendDiv) { legendDiv.style.display = 'none'; legendDiv.innerHTML = ''; }
                            if (legendBtn) legendBtn.classList.remove('active');
                        }
                    }
                });
                if (superficieChk && !superficieChk.checked) {
                    superficieChk.checked = true;
                }
            } else {
                if (activeRasterLayerKey === changedLayerKey) {
                    activeRasterLayerKey = null;
                    const algunaOtraTematicaActiva = thematicRasterKeys.some(key => {
                        const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
                        return chk && chk.checked;
                    });
                    if (!algunaOtraTematicaActiva && superficieChk && superficieChk.checked) {
                        superficieChk.checked = false;
                    }
                }
            }
        } else if (changedLayerKey === 'superficie') {
            if (!isChecked && activeRasterLayerKey) {
                if (superficieChk) superficieChk.checked = true;
                alert("La capa 'Superficie' es necesaria mientras una capa ráster temática esté activa.");
                needsLayerReorder = false;
            }
        }
    }

    if (needsLayerReorder || changedLayerKey === null) {
        updateAllVisibleLayersOrder();
    }
}

document.addEventListener('DOMContentLoaded', initializeCesiumApp);