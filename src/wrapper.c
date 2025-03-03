#include "plist/plist.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <errno.h>

const char* DATA_IN_PATH = "/data.plist";
const char* DATA_OUT_PATH = "/data.output";

const int OUT_DOC_TYPE_XML = 0;
const int OUT_DOC_TYPE_JSON = 1;

char* result = NULL;

char* run(int out_doc_type) {
    int input_res = PLIST_ERR_UNKNOWN;
    int output_res = PLIST_ERR_UNKNOWN;
    FILE *iplist = NULL;
    plist_t root_node = NULL;
    char *plist_out = NULL;
    uint32_t size = 0;
    int read_size = 0;
    char *plist_entire = NULL;
    struct stat filestats;

    if (result != NULL) {
        free(result);
    }
    result = (char *) malloc(sizeof(char) * 256);

    // read input file
    iplist = fopen(DATA_IN_PATH, "rb");
    if (!iplist) {
        sprintf(result, "ERROR: Could not open input file '%s': %s\n", DATA_IN_PATH, strerror(errno));
        return result;
    }

    memset(&filestats, '\0', sizeof(struct stat));
    fstat(fileno(iplist), &filestats);

    plist_entire = (char *) malloc(sizeof(char) * (filestats.st_size + 1));
    read_size = fread(plist_entire, sizeof(char), filestats.st_size, iplist);
    plist_entire[read_size] = '\0';
    fclose(iplist);

    input_res = plist_from_memory(plist_entire, read_size, &root_node, NULL);
    if (input_res == PLIST_ERR_SUCCESS) {
        if (out_doc_type == OUT_DOC_TYPE_XML) {
            output_res = plist_to_xml(root_node, &plist_out, &size);
        } else if (out_doc_type == OUT_DOC_TYPE_JSON) {
            output_res = plist_to_json(root_node, &plist_out, &size, 1);
        }
    }

    plist_free(root_node);
    free(plist_entire);

    if (plist_out) {
        FILE *oplist = fopen(DATA_OUT_PATH, "wb");
        if (!oplist) {
            sprintf(result, "ERROR: Could not open output file '%s': %s\n", DATA_OUT_PATH, strerror(errno));
            return result;
        }
        fwrite(plist_out, size, sizeof(char), oplist);
        fclose(oplist);

        free(plist_out);
    }

    if (input_res == PLIST_ERR_SUCCESS) {
        switch (output_res) {
            case PLIST_ERR_SUCCESS:
                break;
            case PLIST_ERR_FORMAT:
                return "ERROR: Input plist data is not compatible with output format.\n";
                break;
            default:
                sprintf(result, "ERROR: Failed to convert plist data (%d)\n", output_res);
        }
    } else {
        sprintf(result, "ERROR: Could not parse plist data (%d)\n", input_res);
    }

    return result;
}
